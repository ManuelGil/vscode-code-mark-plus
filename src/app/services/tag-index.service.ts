import { PromisePool } from '@supercharge/promise-pool';
import {
  CancellationToken,
  Disposable,
  EventEmitter,
  FileStat,
  Uri,
  workspace,
} from 'vscode';

import {
  TAG_BROWSER_MAX_ENTRIES_PER_TAG,
  TAG_BROWSER_MAX_FILE_SIZE_BYTES,
  TAG_BROWSER_MAX_OCCURRENCES_PER_FILE,
  TAG_BROWSER_MAX_TOTAL_ENTRIES,
} from '../configs';
import { TagBrowserController } from '../controllers';
import {
  escapeRegExp,
  getNormalizedHighlightRules,
  promiseWithTimeout,
} from '../helpers';

// -----------------------------------------------------------------
// Local constants (avoid magic numbers)
// -----------------------------------------------------------------

/**
 * Timeout for per-file operations (stat, openTextDocument) in milliseconds.
 * Prevents the tag scan from hanging on a single slow or remote resource.
 */
const PER_FILE_OPERATION_TIMEOUT_MS = 5000 as const;

/**
 * Represents a single tag occurrence within a file.
 */
export interface TagEntry {
  readonly fileUri: Uri;
  readonly lineNumber: number;
  readonly preview: string;
}

/**
 * Service responsible for scanning workspace files and building an index of tag occurrences.
 *
 * Responsibilities:
 * - Discover candidate files (delegated to TagBrowserController)
 * - Compile highlight rules into efficient regular expressions
 * - Scan files with concurrency and file-size limits
 * - Cache per-file results keyed by mtime to avoid re-scanning unchanged files
 * - Enforce global and per-file caps while merging results
 *
 * The provider consumes grouped occurrences to build the tree view, keeping UI concerns separate.
 */
export class TagIndexService implements Disposable {
  private readonly perFileCache: Map<
    string,
    { mtime: number; byTagKey: Map<string, TagEntry[]> }
  > = new Map();

  private readonly onDidUpdateIndexEmitter = new EventEmitter<void>();
  readonly onDidUpdateIndex = this.onDidUpdateIndexEmitter.event;

  private fullIndex = new Map<string, Map<string, TagEntry[]>>();

  constructor(private readonly controller: TagBrowserController) {}

  /**
   * Clear all internal caches. Call when configuration changes or on manual refresh.
   */
  clear(): void {
    this.perFileCache.clear();
  }

  /**
   * Dispose resources. Currently aliases clear() for future extensibility.
   */
  dispose(): void {
    this.clear();
  }

  /**
   * Prunes the per-file cache to keep memory bounded by removing the oldest
   * entries (by mtime) when the map exceeds the maximum allowed size.
   * This is a simple FIFO/aging strategy suitable for large workspaces.
   *
   * @param maxEntries Maximum number of entries to retain in the cache.
   */
  private prunePerFileCache(maxEntries: number): void {
    if (maxEntries <= 0 || this.perFileCache.size < maxEntries) {
      return;
    }
    const entriesByAge = Array.from(this.perFileCache.entries()).sort(
      (left, right) => left[1].mtime - right[1].mtime,
    );
    const excess = this.perFileCache.size - maxEntries + 1;
    for (let index = 0; index < excess; index++) {
      this.perFileCache.delete(entriesByAge[index][0]);
    }
  }

  /**
   * Scans the entire workspace for tags and rebuilds the index.
   * Notifies listeners via onDidUpdateIndex upon completion.
   *
   * @param token Optional cancellation token to abort the scan early.
   * @returns A promise that resolves when the scan completes (or exits early if cancelled).
   */
  async scanWorkspace(token?: CancellationToken): Promise<void> {
    if (token?.isCancellationRequested) {
      return;
    }
    this.fullIndex = await this.gatherOccurrences(token);
    if (token?.isCancellationRequested) {
      return;
    }
    this.onDidUpdateIndexEmitter.fire();
  }

  /**
   * Returns the full tag index.
   * @returns The complete index: tagKey -> (filePath -> TagEntry[])
   */
  getIndex(): ReadonlyMap<string, Map<string, TagEntry[]>> {
    return this.fullIndex;
  }

  /**
   * Builds a map of tag keys to their configured priority for UI sorting.
   * Values come from `tags.tagProfiles` and `tags.tagPriorities` where
   * `tagPriorities` entries override `tagProfiles`.
   *
   * Tags without an explicit priority are omitted from the map so that
   * consumers can apply a default fallback as needed.
   *
   * @returns Readonly map of tag -> priority number.
   */
  getTagPriorityMap(): ReadonlyMap<string, number> {
    const priorityMap: Map<string, number> = new Map();

    // From profiles (baseline priorities)
    const profiles = this.controller.config?.tagProfiles ?? {};
    for (const [tagKey, profile] of Object.entries(profiles)) {
      if (typeof profile?.priority === 'number') {
        priorityMap.set(tagKey, profile.priority);
      }
    }

    // From explicit tagPriorities (overrides)
    const tagPriorities = this.controller.config?.tagPriorities ?? [];
    for (const item of tagPriorities) {
      if (
        item &&
        typeof item.tag === 'string' &&
        typeof item.priority === 'number'
      ) {
        priorityMap.set(item.tag, item.priority);
      }
    }

    return priorityMap;
  }

  /**
   * Retrieves all occurrences for a specific file from the index.
   * @param fileUri The URI of the file.
   * @returns A map of tag occurrences for the file: tagKey -> TagEntry[]
   */
  getByFile(fileUri: Uri): ReadonlyMap<string, TagEntry[]> | undefined {
    const result = new Map<string, TagEntry[]>();
    for (const [tagKey, fileMap] of this.fullIndex.entries()) {
      const entries = fileMap.get(fileUri.fsPath);
      if (entries) {
        result.set(tagKey, entries);
      }
    }
    return result.size > 0 ? result : undefined;
  }

  /**
   * Gathers tag occurrences for the current workspace based on configured highlight rules.
   *
   * @private
   * @returns Promise resolving to a map: tagKey -> (filePath -> TagEntry[])
   */
  private async gatherOccurrences(
    token?: CancellationToken,
  ): Promise<Map<string, Map<string, TagEntry[]>>> {
    // 1) Get candidate files via controller
    if (token?.isCancellationRequested) {
      return new Map();
    }
    const fileNodeModels = await this.controller.getFiles();
    if (!Array.isArray(fileNodeModels) || fileNodeModels.length === 0) {
      return new Map();
    }

    // 2) Prepare rules → regexes
    const normalizedHighlightRules = getNormalizedHighlightRules(
      this.controller.config,
    );
    const ruleDefinitions = normalizedHighlightRules
      .map((rule) => {
        const key = rule.keyword ?? rule.pattern!; // safe after normalization

        // Determine regex flags
        let flags = 'g';
        if (rule.caseSensitive === false) {
          flags += 'i';
        }

        // Build source depending on match mode/wholeWord
        let source: string;
        if (rule.matchMode === 'regex' && rule.pattern) {
          source = rule.pattern;
        } else {
          const literalBase = rule.keyword ?? rule.pattern ?? '';
          const escaped = escapeRegExp(literalBase);
          const whole = rule.matchMode === 'word' || rule.wholeWord === true;
          // Allow either `TODO` or `TODO:` for keyword-driven rules.
          source = whole ? `\\b${escaped}\\b:?` : `${escaped}:?`;
        }

        const languageIds =
          Array.isArray(rule.languageIds) && rule.languageIds.length > 0
            ? rule.languageIds
            : undefined;

        return { key, source, flags, languageIds };
      })
      .filter((ruleDef) => Boolean(ruleDef.key));

    if (ruleDefinitions.length === 0) {
      return new Map();
    }

    // Precompile regex objects once per scan
    const compiledRuleRegexList: {
      key: string;
      regex: RegExp;
      languageIds?: string[];
    }[] = [];
    for (const ruleDef of ruleDefinitions) {
      try {
        compiledRuleRegexList.push({
          key: ruleDef.key as string,
          regex: new RegExp(ruleDef.source, ruleDef.flags),
          languageIds: (ruleDef as { languageIds?: string[] }).languageIds,
        });
      } catch {
        // Skip invalid regexes
      }
    }

    // 3) Group occurrences: tag -> file -> entries
    const entriesByTagKeyMap = new Map<string, Map<string, TagEntry[]>>();
    for (const ruleDef of ruleDefinitions) {
      if (!entriesByTagKeyMap.has(ruleDef.key as string)) {
        entriesByTagKeyMap.set(ruleDef.key as string, new Map());
      }
    }

    const fileUriList = fileNodeModels
      .map((fileNode) => fileNode.resourceUri)
      .filter((uri): uri is Uri => Boolean(uri));

    const maximumFilesToIndex = Math.max(
      1,
      this.controller.config?.maxFilesToIndex ?? 1000,
    );
    const cappedFileUriList = fileUriList.slice(0, maximumFilesToIndex);

    // Global caps
    const entriesCountByTagKeyMap = new Map<string, number>();
    for (const ruleDef of ruleDefinitions) {
      entriesCountByTagKeyMap.set(ruleDef.key as string, 0);
    }
    let totalEntries = 0;
    const tagsThatReachedCapSet = new Set<string>();
    let reachedGlobalEntriesCap = false;

    const maximumConcurrencyLimit = Math.max(
      1,
      this.controller.config?.concurrencyLimit ?? 10,
    );

    await PromisePool.for(cappedFileUriList)
      .withConcurrency(maximumConcurrencyLimit)
      .process(async (fileUri) => {
        if (reachedGlobalEntriesCap || token?.isCancellationRequested) {
          return;
        }

        try {
          // Skip overly large files
          const maxFileSizeBytes = TAG_BROWSER_MAX_FILE_SIZE_BYTES;
          let fileStat: FileStat;
          try {
            fileStat = await promiseWithTimeout(
              workspace.fs.stat(fileUri),
              PER_FILE_OPERATION_TIMEOUT_MS,
              `Stat timed out for ${fileUri.fsPath}`,
            );
            if (fileStat.size > maxFileSizeBytes) {
              return;
            }
          } catch {
            return;
          }

          // Cache by mtime
          const cacheKey = fileUri.fsPath;
          const currentMtime = fileStat.mtime;
          let perFileMap: Map<string, TagEntry[]> | undefined =
            this.perFileCache.get(cacheKey)?.byTagKey;
          const isCacheValid =
            perFileMap !== undefined &&
            this.perFileCache.get(cacheKey)?.mtime === currentMtime;

          if (!isCacheValid) {
            perFileMap = new Map();
            const textDocument = await promiseWithTimeout(
              workspace.openTextDocument(fileUri),
              PER_FILE_OPERATION_TIMEOUT_MS,
              `Open document timed out for ${fileUri.fsPath}`,
            );
            const documentText = textDocument.getText();
            const maxOccurrencesPerFile = TAG_BROWSER_MAX_OCCURRENCES_PER_FILE;
            let occurrencesForFileScan = 0;

            for (const compiled of compiledRuleRegexList) {
              if (token?.isCancellationRequested) {
                break;
              }
              const allowedLanguageIds = compiled.languageIds;
              if (allowedLanguageIds && allowedLanguageIds.length > 0) {
                const documentLanguageId = textDocument.languageId;
                if (!allowedLanguageIds.includes(documentLanguageId)) {
                  continue;
                }
              }

              const regex = compiled.regex;
              regex.lastIndex = 0;
              let match: RegExpExecArray | null;
              while (
                (match = regex.exec(documentText)) &&
                occurrencesForFileScan < maxOccurrencesPerFile
              ) {
                if (token?.isCancellationRequested) {
                  break;
                }
                const position = textDocument.positionAt(match.index);
                const lineNumber = position.line;
                const lineText = textDocument.lineAt(lineNumber).text.trim();
                const preview =
                  lineText.length > 200
                    ? `${lineText.slice(0, 200)}…`
                    : lineText;
                const tagKey = compiled.key;

                if (!perFileMap.has(tagKey)) {
                  perFileMap.set(tagKey, []);
                }

                perFileMap.get(tagKey)!.push({
                  fileUri,
                  lineNumber,
                  preview,
                });
                occurrencesForFileScan++;

                if (match[0].length === 0) {
                  // Avoid zero-length match infinite loops
                  regex.lastIndex++;
                }
              }

              if (occurrencesForFileScan >= maxOccurrencesPerFile) {
                break;
              }
            }

            // Update cache
            const maxPerFileCacheEntries = 2000 as const;
            this.prunePerFileCache(maxPerFileCacheEntries);
            this.perFileCache.set(cacheKey, {
              mtime: currentMtime,
              byTagKey: perFileMap,
            });
          }

          // Merge into global map with caps
          let pushedForFileCount = 0;
          const maxPerFileMerge = TAG_BROWSER_MAX_OCCURRENCES_PER_FILE;

          for (const [tagKey, tagEntries] of perFileMap!.entries()) {
            if (reachedGlobalEntriesCap || token?.isCancellationRequested) {
              break;
            }
            if (tagsThatReachedCapSet.has(tagKey)) {
              continue;
            }

            const byFilePath = entriesByTagKeyMap.get(tagKey)!;
            const filePath = fileUri.fsPath;
            if (!byFilePath.has(filePath)) {
              byFilePath.set(filePath, []);
            }

            for (const entry of tagEntries) {
              if (reachedGlobalEntriesCap || token?.isCancellationRequested) {
                break;
              }
              const currentCountForTag =
                (entriesCountByTagKeyMap.get(tagKey) ?? 0) + 1;
              entriesCountByTagKeyMap.set(tagKey, currentCountForTag);
              totalEntries++;
              byFilePath.get(filePath)!.push(entry);
              pushedForFileCount++;

              if (currentCountForTag >= TAG_BROWSER_MAX_ENTRIES_PER_TAG) {
                tagsThatReachedCapSet.add(tagKey);
              }
              if (totalEntries >= TAG_BROWSER_MAX_TOTAL_ENTRIES) {
                reachedGlobalEntriesCap = true;
                break;
              }
              if (pushedForFileCount >= maxPerFileMerge) {
                break;
              }
            }
          }
        } catch {
          // Keep scan resilient by ignoring per-file errors
        }
      });

    return entriesByTagKeyMap;
  }
}
