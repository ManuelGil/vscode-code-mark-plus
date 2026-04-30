import {
  DecorationOptions,
  DecorationRangeBehavior,
  DecorationRenderOptions,
  l10n,
  Position,
  Range,
  TextDocument,
  TextEditor,
  TextEditorDecorationType,
  window,
} from 'vscode';

import { ExtensionConfig } from '../configs';
import { escapeRegExp, getNormalizedHighlightRules } from '../helpers';

/**
 * HighlightController manages syntax highlighting within the editor.
 * It creates decorations for predefined keywords and special highlight directives.
 *
 * @class HighlightController
 * @example
 * const service = new HighlightController(config);
 * service.updateHighlighting(editor);
 *
 * @param {ExtensionConfig} config - The configuration object
 * @public
 * @memberof HighlightController
 *
 * @property {ExtensionConfig} config - The configuration object
 * @property {{ [key: string]: TextEditorDecorationType }} decorationTypes - A map of decoration types for each configured keyword
 * @property {TextEditorDecorationType} specialDecoration - A decoration type for special highlight directives
 *
 * @returns {HighlightController} - A new instance of the HighlightController class
 */
export class HighlightController {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Private properties

  /**
   * Maximum file size in bytes for which full highlighting will be applied.
   * Files larger than this will have limited or no highlighting to preserve performance.
   *
   * @private
   * @type {number}
   * @memberof HighlightController
   */
  private readonly maxFileSize = 1024 * 1024; // 1MB limit

  /**
   * Number of lines to include as buffer above and below visible ranges.
   * This ensures smooth scrolling by pre-decorating content that's about to become visible.
   *
   * A larger buffer reduces flickering when scrolling quickly but increases processing time.
   * The default value of 100 lines provides a good balance between smoothness and performance.
   *
   * @private
   * @type {number}
   * @memberof HighlightController
   */
  private readonly bufferLines = 100; // Lines above/below visible area to decorate

  /**
   * A map of decoration types for each configured keyword.
   *
   * @private
   * @type {{ [key: string]: TextEditorDecorationType }}
   * @memberof HighlightController
   */
  private decorationTypes: { [key: string]: TextEditorDecorationType } = {};

  /**
   * A decoration type for special highlight directives.
   *
   * @private
   * @type {TextEditorDecorationType}
   * @memberof HighlightController
   */
  private specialDecoration!: TextEditorDecorationType;

  /**
   * Cache for compiled regex patterns to improve performance
   *
   * @private
   * @type {Map<string, RegExp>}
   * @memberof HighlightController
   */
  private regexCache: Map<string, RegExp> = new Map();

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the HighlightController class
   *
   * @constructor
   * @param {ExtensionConfig} config - The configuration object
   * @public
   * @memberof HighlightController
   * @example
   * const service = new HighlightController(config);
   *
   * @returns {HighlightController} - A new instance of the HighlightController class
   */
  constructor(readonly config: ExtensionConfig) {
    this.createDecorationTypes();
    this.createSpecialDecoration();
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * Updates syntax highlighting in the active editor.
   * This method is triggered by editor events like document changes, editor switches,
   * configuration changes, and visible range changes.
   *
   * Performance optimization strategy:
   * 1. For large files (>1MB), limited or no highlighting is applied
   * 2. When visible ranges exist, highlighting is restricted to those ranges plus a buffer zone
   * 3. Buffer zones are added above and below visible ranges (configured by bufferLines property)
   * 4. Overlapping ranges are merged to avoid redundant processing
   *
   * This visible ranges plus buffer approach significantly improves performance for large files
   * and reduces flickering during scrolling by processing only what's needed.
   *
   * @function updateHighlighting
   * @public
   * @memberof HighlightController
   * @example
   * service.updateHighlighting(editor);
   *
   * @param {TextEditor} editor - The editor to update highlighting in
   *
   * @returns {void} - No return value
   */
  updateHighlighting(editor: TextEditor): void {
    try {
      if (!editor) {
        return;
      }

      this.clearHighlighting(editor);

      // Compute text once to avoid repeated full-document reads downstream
      const text: string = editor.document.getText();

      // Check file size to avoid performance issues with large files
      const fileSize = text.length;
      if (fileSize > this.maxFileSize) {
        // For large files, we apply limited highlighting or skip it entirely
        window.setStatusBarMessage(
          l10n.t(
            'CodeMark+: Limited highlighting applied (file size: {0} KB exceeds limit)',
            String(Math.round(fileSize / 1024)),
          ),
          5000,
        );
        return;
      }

      const decorations = this.getHighlightDecorations(
        editor.document,
        editor.visibleRanges,
        { text, lines: text.split('\n') },
      );

      for (const deco of decorations) {
        editor.setDecorations(deco.type, deco.ranges);
      }
    } catch (error) {
      console.error('Error updating highlighting:', error);
      window.showErrorMessage(
        l10n.t('An unexpected error occurred while updating highlighting'),
      );
    }
  }

  /**
   * Clears all highlight decorations in the given editor.
   * This method is called when the configuration changes.
   *
   * @function clearHighlighting
   * @public
   * @memberof HighlightController
   * @example
   * service.clearHighlighting(editor);
   *
   * @param {TextEditor} editor - The editor to clear highlighting from
   *
   * @returns {void} - No return value
   */
  clearHighlighting(editor: TextEditor): void {
    if (!editor) {
      return;
    }

    const allDecorations = Object.values(this.decorationTypes);
    if (this.specialDecoration) {
      allDecorations.push(this.specialDecoration);
    }

    for (const decorationType of allDecorations) {
      editor.setDecorations(decorationType, []);
    }
  }

  /**
   * Refreshes configuration by reloading highlight rules and special decoration options.
   * This method is called when the configuration changes.
   *
   * @function refreshConfiguration
   * @public
   * @memberof HighlightController
   * @example
   * service.refreshConfiguration();
   *
   * @returns {void} - No return value
   */
  refreshConfiguration(): void {
    // Clear existing decorations and caches (both decoration types and regex patterns)
    this.clearCaches();
    this.createDecorationTypes();
    this.createSpecialDecoration();
  }

  /**
   * Clears all decoration and regex caches
   * This method is called when configuration changes to ensure fresh state
   *
   * @function clearCaches
   * @private
   * @memberof HighlightController
   */
  private clearCaches(): void {
    // Dispose and clear decoration types
    Object.values(this.decorationTypes).forEach((decoration) =>
      decoration.dispose(),
    );
    this.decorationTypes = {};

    // Clear regex pattern cache
    this.regexCache.clear();
  }

  private expandRangesWithBuffer(
    document: TextDocument,
    ranges: readonly Range[],
  ): Range[] {
    if (!ranges.length) {
      return [];
    }

    const maxLine = document.lineCount - 1;

    // Create expanded ranges with buffer lines added
    const expandedRanges = ranges.map((range) => {
      // Calculate buffered start and end lines, clamping to document boundaries
      const startLine = Math.max(0, range.start.line - this.bufferLines);
      const endLine = Math.min(maxLine, range.end.line + this.bufferLines);

      // Create new Range with full line widths
      return new Range(
        new Position(startLine, 0),
        new Position(endLine, document.lineAt(endLine).text.length),
      );
    });

    // Merge overlapping ranges to avoid duplicate processing
    return this.mergeOverlappingRanges(expandedRanges);
  }

  /**
   * Merges overlapping ranges to create a minimal set of non-overlapping ranges.
   * This helps avoid processing the same line multiple times when ranges overlap.
   *
   * Algorithm:
   * 1. Sort ranges by start line and character
   * 2. Initialize with the first range as the current range
   * 3. For each subsequent range, check if it overlaps or is adjacent to current range
   * 4. If overlapping/adjacent, extend current range; otherwise add current to results and start new
   * 5. Finally add the last processed range
   *
   * This is an important optimization when multiple visible ranges are close to each other
   * or when the buffer zones create overlaps between expanded ranges.
   *
   * @param ranges - Array of possibly overlapping ranges
   * @returns Array of merged non-overlapping ranges
   */
  private mergeOverlappingRanges(ranges: readonly Range[]): Range[] {
    if (!ranges || ranges.length <= 1) {
      return Array.from(ranges || []);
    }

    // Create a copy to avoid modifying the input
    const sortedRanges = Array.from(ranges).sort((a, b) => {
      // Sort by start line, then by start character
      if (a.start.line !== b.start.line) {
        return a.start.line - b.start.line;
      }
      return a.start.character - b.start.character;
    });

    const result: Range[] = [];
    let currentRange = sortedRanges[0];

    for (let i = 1; i < sortedRanges.length; i++) {
      const range = sortedRanges[i];

      // Check if ranges overlap or are adjacent
      if (range.start.line <= currentRange.end.line + 1) {
        // Extend currentRange if the new range goes further
        if (
          range.end.line > currentRange.end.line ||
          (range.end.line === currentRange.end.line &&
            range.end.character > currentRange.end.character)
        ) {
          currentRange = new Range(currentRange.start, range.end);
        }
      } else {
        // No overlap, add current range to result and start a new one
        result.push(currentRange);
        currentRange = range;
      }
    }

    // Add the last range
    result.push(currentRange);

    return result;
  }

  /**
   * Gets all highlight decorations for the document, optionally limiting to specific ranges.
   * When ranges are provided, only decorations within those ranges are computed,
   * which significantly improves performance for large files.
   *
   * Optimization workflow:
   * 1. If ranges are provided (typically from editor.visibleRanges), expand them with buffer
   * 2. Process keyword decorations only within expanded ranges
   * 3. Process special highlight directives only within expanded ranges
   * 4. Combine both types of decorations for the final result
   *
   * This method is the central coordination point for the visible ranges plus buffer
   * optimization, delegating actual decoration computation to more specialized methods
   * while ensuring they only process relevant document regions.
   *
   * @param document - The document to analyze
   * @param ranges - Optional array of ranges to limit decoration computation
   * @param precomputed - Optional precomputed full document text and its lines to avoid repeated reads
   * @returns A list of decoration objects with type and range
   */
  private getHighlightDecorations(
    document: TextDocument,
    ranges?: readonly Range[],
    precomputed?: { text: string; lines: string[] },
  ): Array<{
    type: TextEditorDecorationType;
    ranges: DecorationOptions[];
  }> {
    // Expand visible ranges with buffer for smoother scrolling experience
    const expandedRanges = ranges
      ? this.expandRangesWithBuffer(document, ranges)
      : undefined;

    const keywordDecorations = this.getKeywordDecorations(
      document,
      expandedRanges,
      precomputed?.lines,
    );
    const specialDecorations = this.getSpecialHighlightDecorations(
      document,
      expandedRanges,
      precomputed?.text,
      precomputed?.lines,
    );
    return [...keywordDecorations, ...specialDecorations];
  }

  /**
   * Computes decorations for configured keyword rules, optionally limited to specific ranges.
   * Accepts optional precomputed document lines to avoid repeated splits.
   *
   * @param document - Target document.
   * @param ranges - Optional ranges limiting which lines to scan.
   * @param lines - Optional precomputed document lines to avoid splitting text repeatedly.
   * @returns A list of decoration objects each with a type and its corresponding ranges.
   */
  private getKeywordDecorations(
    document: TextDocument,
    ranges?: readonly Range[],
    lines?: string[],
  ): Array<{
    type: TextEditorDecorationType;
    ranges: DecorationOptions[];
  }> {
    const workingLines: string[] = lines ?? document.getText().split('\n');

    // Create maps to store decorations and priorities
    const decorations: { [key: string]: DecorationOptions[] } = {};
    const priorityByKeyword: Map<string, number> = new Map();

    // Get current document language ID for filtering
    const documentLangId = document.languageId;

    // Pre-compile regexes for efficiency using normalized rules with grouped settings
    const allRules = getNormalizedHighlightRules(this.config);

    // Apply language filtering: include rules that either have no languageIds specified
    // or include the current document's languageId
    const languageFilteredRules = allRules.filter((rule) => {
      // If languageIds is undefined, null, or empty array, include the rule (apply to all languages)
      if (!rule.languageIds || rule.languageIds.length === 0) {
        return true;
      }
      // Otherwise, only include if the current language matches one in the rule's languageIds
      return (
        Array.isArray(rule.languageIds) &&
        rule.languageIds.includes(documentLangId)
      );
    });

    // Store priority values for keywords for later use in overlap resolution
    for (const rule of languageFilteredRules) {
      const key = rule.keyword ?? rule.pattern!;
      const priority = rule.priority ?? 0;
      priorityByKeyword.set(key, priority);
    }

    const rules = languageFilteredRules
      .map((rule) => {
        // Derive a safe key for indexing decoration types and ranges
        const key = rule.keyword ?? rule.pattern!;

        // Determine regex flags
        let flags = 'g';
        if (rule.caseSensitive === false) {
          flags += 'i';
        }

        // Build pattern source depending on match mode
        let source: string;
        const literalBase = rule.keyword ?? rule.pattern ?? '';
        const literal = escapeRegExp(literalBase);

        switch (rule.matchMode) {
          case 'regex':
            // Use regex pattern directly; if none, treat keyword as the regex source
            if (rule.pattern) {
              source = rule.pattern;
            } else if (rule.keyword) {
              // In regex mode without an explicit pattern, keyword is interpreted as a regex
              source = rule.keyword;
            } else {
              // As a final fallback, use the escaped literal (should not generally happen due to normalization)
              source = literal;
            }
            break;

          case 'word':
            // Word mode: match complete words only using word boundaries
            // Allow either `TODO` or `TODO:` for keyword-based rules.
            source = `\\b${literal}\\b:?`;
            break;

          case 'substring':
          default:
            // Substring mode: always match occurrences within words; wholeWord has no effect
            // Allow either `TODO` or `TODO:` for keyword-based rules.
            source = `${literal}:?`;
            break;
        }

        // Create a cache key based on pattern source and flags
        const cacheKey = `${source}|${flags}`;

        // Create regex with safety - check cache first or compile if not found
        let regex: RegExp | null = null;

        // Try to get from cache first
        if (this.regexCache.has(cacheKey)) {
          regex = this.regexCache.get(cacheKey)!;
        } else {
          try {
            regex = new RegExp(source, flags);
            // Store successfully compiled regex in cache
            this.regexCache.set(cacheKey, regex);
          } catch (error) {
            // Log warning but continue with other rules
            console.warn(
              `Invalid regex pattern in highlight rule: ${source}`,
              error,
            );
            const skippedPreview = `${source.substring(0, 15)}${source.length > 15 ? '...' : ''}`;
            window.setStatusBarMessage(
              l10n.t(
                'CodeMark+: Skipped invalid regex pattern: {0}',
                skippedPreview,
              ),
              5000,
            );
          }
        }

        return {
          key,
          regex,
        };
      })
      // Only use rules with existing decoration types and valid regex
      .filter(
        (compiledRule) =>
          Boolean(this.decorationTypes[compiledRule.key]) &&
          compiledRule.regex !== null,
      );

    // If ranges are provided, determine which lines to process
    const linesToProcess: Array<{ start: number; end: number }> = [];

    if (ranges && ranges.length > 0) {
      // Process only lines within the provided ranges
      for (const range of ranges) {
        linesToProcess.push({
          start: range.start.line,
          end: range.end.line,
        });
      }
    } else {
      // Process all lines if no ranges are provided
      linesToProcess.push({ start: 0, end: workingLines.length - 1 });
    }

    // Process only the relevant lines
    for (const lineRange of linesToProcess) {
      for (
        let lineIndex = lineRange.start;
        lineIndex <= lineRange.end;
        lineIndex++
      ) {
        if (lineIndex < 0 || lineIndex >= workingLines.length) {
          continue;
        }

        const line = workingLines[lineIndex];
        const lineOffset = document.offsetAt(new Position(lineIndex, 0));

        for (const rule of rules) {
          // Safety check — this should not be necessary due to prior filtering,
          // but strict TypeScript checks require this guard
          if (rule.regex === null) {
            continue;
          }

          rule.regex.lastIndex = 0; // Reset regex state for each line
          let match: RegExpExecArray | null;
          while ((match = rule.regex.exec(line))) {
            const start = document.positionAt(lineOffset + match.index);
            const end = document.positionAt(
              lineOffset + match.index + match[0].length,
            );
            const range = new Range(start, end);

            if (!decorations[rule.key]) {
              decorations[rule.key] = [];
            }
            decorations[rule.key].push({ range });

            // Guard against zero-length matches to avoid infinite loops
            if (match[0].length === 0) {
              rule.regex.lastIndex++;
            }
          }
        }
      }
    }

    // Track all matches with their priorities for overlap resolution
    const allMatchesWithPriority: Array<{
      key: string;
      range: Range;
      priority: number;
    }> = [];

    // Collect all matches with their priorities
    for (const key in decorations) {
      const priority = priorityByKeyword.get(key) ?? 0;
      for (const decoration of decorations[key]) {
        allMatchesWithPriority.push({
          key,
          range: decoration.range,
          priority,
        });
      }
    }

    // Sort all matches by priority (higher number = higher priority)
    allMatchesWithPriority.sort((a, b) => b.priority - a.priority);

    // Create a new map to store non-overlapping decorations by keyword
    const resolvedDecorations: { [key: string]: DecorationOptions[] } = {};

    // Process matches in priority order, skipping those that overlap with higher priority matches
    const occupiedRanges: Range[] = [];
    for (const match of allMatchesWithPriority) {
      // Check if this range overlaps with any higher priority range
      const isOverlapping = occupiedRanges.some(
        (range) => range.intersection(match.range) !== undefined,
      );

      // If no overlap, add it to the resolved decorations
      if (!isOverlapping) {
        if (!resolvedDecorations[match.key]) {
          resolvedDecorations[match.key] = [];
        }
        resolvedDecorations[match.key].push({ range: match.range });
        occupiedRanges.push(match.range);
      }
    }

    // Format the results for the editor
    return Object.keys(resolvedDecorations).map((keyword) => ({
      type: this.decorationTypes[keyword],
      ranges: resolvedDecorations[keyword],
    }));
  }

  /**
   * Retrieves decorations for special highlight directives, optionally limited to specific ranges.
   * Supports directives like "HIGHLIGHT: next line" or "HIGHLIGHT: range 10-20".
   *
   * @param document - The document to analyze
   * @param ranges - Optional array of ranges to limit decoration computation
   * @param text - Optional precomputed full document text to avoid repeated reads
   * @param lines - Optional precomputed document lines to avoid repeated splitting
   * @returns A list of decoration objects with type and range
   */
  private getSpecialHighlightDecorations(
    document: TextDocument,
    ranges?: readonly Range[],
    text?: string,
    lines?: string[],
  ): Array<{
    type: TextEditorDecorationType;
    ranges: DecorationOptions[];
  }> {
    const specialRanges: DecorationOptions[] = [];
    const workingText: string = text ?? document.getText();
    const workingLines: string[] = lines ?? workingText.split('\n');
    const directiveRegex = /\/\/\s*HIGHLIGHT:\s*(.+)/i;

    // If ranges are provided, determine which lines to process
    const linesToProcess: Array<{ start: number; end: number }> = [];

    if (ranges && ranges.length > 0) {
      // Process only lines within the provided ranges
      for (const range of ranges) {
        linesToProcess.push({
          start: range.start.line,
          end: range.end.line,
        });
      }
    } else {
      // Process all lines if no ranges are provided
      linesToProcess.push({ start: 0, end: workingLines.length - 1 });
    }

    // Process only the relevant lines
    for (const lineRange of linesToProcess) {
      for (let i = lineRange.start; i <= lineRange.end; i++) {
        if (i < 0 || i >= workingLines.length) {
          continue;
        }

        const match = directiveRegex.exec(workingLines[i]);
        if (match) {
          const directive = match[1].trim();
          const ranges = this.parseSpecialDirective(
            directive,
            document,
            i,
            workingLines,
          );
          specialRanges.push(...ranges);
        }
      }
    }

    return specialRanges.length > 0
      ? [{ type: this.specialDecoration, ranges: specialRanges }]
      : [];
  }

  /**
   * Parses special highlight directives and determines the lines to highlight.
   * Supported directives include "next line", "previous line", "current line",
   * "line N", and "range N-M".
   *
   * @function parseSpecialDirective
   * @private
   * @memberof HighlightController
   * @example
   * const ranges = service.parseSpecialDirective(directive, document, lineIndex, lines);
   *
   * @param {string} directive - The directive to parse
   * @param {TextDocument} document - The document containing the directive
   * @param {number} lineIndex - The line number where the directive was found
   * @param {string[]} lines - The document text split into lines
   *
   * @returns {DecorationOptions[]} - A list of decoration ranges based on the directive
   */
  private parseSpecialDirective(
    directive: string,
    document: TextDocument,
    lineIndex: number,
    lines: string[],
  ): DecorationOptions[] {
    const ranges: DecorationOptions[] = [];
    const addRange = (targetLine: number): void => {
      if (targetLine >= 0 && targetLine < lines.length) {
        const range = document.lineAt(targetLine).range;
        ranges.push({ range });
      }
    };

    const lowerDirective = directive.toLowerCase();

    if (lowerDirective.startsWith('next line')) {
      addRange(lineIndex + 1);
    } else if (lowerDirective.startsWith('previous line')) {
      addRange(lineIndex - 1);
    } else if (lowerDirective.startsWith('current line')) {
      addRange(lineIndex);
    } else if (lowerDirective.startsWith('line ')) {
      const parts = lowerDirective.split(' ');
      const targetLine = parseInt(parts[1], 10) - 1;
      addRange(targetLine);
    } else if (lowerDirective.startsWith('range ')) {
      const rangeParts = lowerDirective
        .split(' ')[1]
        .split('-')
        .map((part) => parseInt(part, 10) - 1);
      if (rangeParts.length === 2 && rangeParts[0] <= rangeParts[1]) {
        for (let i = rangeParts[0]; i <= rangeParts[1]; i++) {
          addRange(i);
        }
      }
    }

    return ranges;
  }

  /**
   * Creates syntax highlight decorations for predefined keywords.
   * This method is called when the configuration changes.
   *
   * @function createDecorationTypes
   * @private
   * @memberof HighlightController
   * @example
   * service.createDecorationTypes();
   *
   * @returns {void} - No return value
   */
  private createDecorationTypes(): void {
    for (const key in this.decorationTypes) {
      this.decorationTypes[key].dispose();
    }
    this.decorationTypes = {};

    const normalized = getNormalizedHighlightRules(this.config);

    for (const rule of normalized) {
      const key = rule.keyword ?? rule.pattern!; // safe due to normalization
      const textDecorationParts: string[] = [];

      // Apply underline decoration if configured
      if (rule.underline) {
        textDecorationParts.push('underline');
      }

      // Apply strikethrough decoration if configured
      // This can be combined with underline for special emphasis
      if (rule.strikethrough) {
        textDecorationParts.push('line-through');
      }

      // Create decoration with all configured style options
      this.decorationTypes[key] = this.createDecoration({
        backgroundColor: rule.color,
        fontWeight: rule.bold ? 'bold' : 'normal',
        textDecoration: textDecorationParts.length
          ? textDecorationParts.join(' ')
          : 'none',
        fontStyle: rule.italic ? 'italic' : 'normal',
        borderRadius: '3px',
        // Support showing decorations in the minimap (optional based on performance needs)
        rangeBehavior: DecorationRangeBehavior.ClosedClosed,
      });
    }
  }

  /**
   * Updates the special highlight decoration configuration.
   * This method is called when the configuration changes.
   *
   * @function createSpecialDecoration
   * @private
   * @memberof HighlightController
   * @example
   * service.createSpecialDecoration();
   *
   * @returns {void} - No return value
   */
  private createSpecialDecoration(): void {
    const { specialHighlightDecoration } = this.config.highlighting;

    if (this.specialDecoration) {
      this.specialDecoration.dispose();
    }

    this.specialDecoration = this.createDecoration(specialHighlightDecoration);
  }

  /**
   * Creates a decoration type based on the given render options.
   * This method is used to create decoration types for keywords and special directives.
   *
   * @function createDecoration
   * @private
   * @memberof HighlightController
   * @example
   * const decoration = service.createDecoration(options);
   *
   * @param {DecorationRenderOptions} options - Decoration render options
   *
   * @returns {TextEditorDecorationType} - A configured TextEditorDecorationType instance
   */
  private createDecoration(
    options: DecorationRenderOptions,
  ): TextEditorDecorationType {
    return window.createTextEditorDecorationType(options);
  }
}
