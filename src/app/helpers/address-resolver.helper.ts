import { basename, isAbsolute, join } from 'path';
import { Position, Range, Uri, workspace } from 'vscode';

import { ExtensionConfig } from '../configs';
import { findFiles } from './find-files.helper';
import { toPosixPath } from './path-format.helper';
import { getWorkspaceRoot } from './workspace-root.helper';

/**
 * Parsed address components extracted from a reference string.
 * Format: path[#line[:hint]] or path#start-end (1-based values).
 */
export type ParsedAddress =
  | { kind: 'file'; tag?: string; path: string }
  | {
      kind: 'anchor';
      tag?: string;
      path: string;
      line: number;
      column?: number;
    }
  | {
      kind: 'range';
      tag?: string;
      path: string;
      startLine: number;
      endLine: number;
    };

/**
 * Explicit discriminated union for address resolution outcomes.
 * Eliminates undefined leakage by requiring exhaustive pattern matching.
 *
 * Each outcome is self-describing and difficult to misuse accidentally.
 */
export type AddressResolutionResult =
  | {
      /**
       * Resolution succeeded with a single definitive Uri.
       * May optionally include editor range for cursor positioning.
       */
      kind: 'resolved';
      uri: Uri;
      range?: Range;
    }
  | {
      /**
       * Resolution found multiple candidates; user must choose.
       * May optionally include editor range for all candidates.
       */
      kind: 'ambiguous';
      candidates: Uri[];
      range?: Range;
    }
  | {
      /**
       * Resolution failed; address could not be located.
       * No further data available.
       */
      kind: 'unresolved';
    };

/**
 * Parse a lightweight address string into components.
 * Format: path[#line[:hint]] or path#start-end (1-based values)
 *
 * Examples:
 * - backend/ws/reconnect.ts
 * - backend/ws/reconnect.ts#20
 * - backend/ws/reconnect.ts#20:5
 * - backend/ws/reconnect.ts#20-30
 * - TODO(backend/ws/reconnect.ts)
 * - TODO(backend/ws/reconnect.ts#20:5)
 *
 * @param address The reference string to parse
 * @returns Parsed components or undefined if invalid
 */
export function parseAddress(address: string): ParsedAddress | undefined {
  if (!address || typeof address !== 'string') {
    return undefined;
  }
  const trimmed = address.trim();

  const tagMatch = /^(\w+)\((.+)\):?$/.exec(trimmed);
  const tag = tagMatch?.[1];
  const innerAddress = tagMatch?.[2]?.trim() ?? trimmed;

  // Match `path[#line[:hint]]` (1-based values in text)
  // Explicit line-range: path#start-end (e.g., file.ts#10-20)
  const rangeMatch = /^(.+?)#(\d+)-(\d+)$/.exec(innerAddress);
  if (rangeMatch) {
    const filePath = rangeMatch[1].trim();
    if (!filePath) {
      return undefined;
    }
    const startLine = Number(rangeMatch[2]);
    const endLine = Number(rangeMatch[3]);
    if (Number.isNaN(startLine) || Number.isNaN(endLine)) {
      return undefined;
    }
    const parsed: ParsedAddress = {
      kind: 'range',
      path: filePath,
      startLine,
      endLine,
    };
    if (tag) {
      parsed.tag = tag;
    }
    return parsed;
  }

  // Anchor: path#line or path#line:hint
  const m = /^(.+?)(?:#(\d+)(?::(\d+))?)?$/.exec(innerAddress);
  if (!m) {
    return undefined;
  }

  const filePath = m[1].trim();
  if (!filePath) {
    return undefined;
  }

  if (m[2]) {
    const line = Number(m[2]);
    if (Number.isNaN(line)) {
      return undefined;
    }
    const parsed: ParsedAddress = { kind: 'anchor', path: filePath, line };
    if (m[3]) {
      const col = Number(m[3]);
      if (!Number.isNaN(col)) {
        (parsed as any).column = col;
      }
    }
    if (tag) {
      (parsed as any).tag = tag;
    }
    return parsed as ParsedAddress;
  }

  // File-only
  const parsedFile: ParsedAddress = { kind: 'file', path: filePath };
  if (tag) {
    (parsedFile as any).tag = tag;
  }
  return parsedFile;
}

/**
 * Resolve a parsed address to a Uri + optional Range using deterministic fallback.
 *
 * Resolution strategy: workspace-first, filesystem-native, bounded, deterministic.
 *
 * **LEVEL 1: Direct filesystem (exact relative path)**
 * Check workspace-relative path directly on filesystem.
 * Fastest path; returns immediately if found.
 *
 * **LEVEL 2: Exact path glob**
 * Glob search for exact relative path match across workspace.
 * Returns single result if unique; collects candidates if ambiguous.
 *
 * **LEVEL 3: Basename glob**
 * Glob search by filename only (loose matching).
 * Prefers exact suffix matches; returns candidates if multiple matches.
 *
 * All levels respect workspace boundaries, are strictly deterministic,
 * and bounded by maxResults. No semantic inference or probabilistic recovery.
 *
 * @param parsed The parsed address components
 * @param config Extension configuration (provides workspace root)
 * @returns Explicit resolution outcome: 'resolved' | 'ambiguous' | 'unresolved'
 */
export async function resolveAddressToUriRange(
  parsed: ParsedAddress,
  config: ExtensionConfig,
): Promise<AddressResolutionResult> {
  if (!parsed || !parsed.path) {
    return { kind: 'unresolved' };
  }

  const workspaceRoot = getWorkspaceRoot(config);
  if (!workspaceRoot) {
    return { kind: 'unresolved' };
  }

  // === LEVEL 1: Direct filesystem (exact relative path) ===
  const result1 = await tryDirectFilesystem(parsed, workspaceRoot);
  if (result1) {
    return result1;
  }

  // === LEVEL 2: Exact path glob ===
  const result2 = await tryExactPathGlob(parsed, workspaceRoot);
  if (result2) {
    return result2;
  }

  // === LEVEL 3: Basename glob ===
  const result3 = await tryBasenameGlob(parsed, workspaceRoot);
  if (result3) {
    return result3;
  }

  return { kind: 'unresolved' };
}

/**
 * RESOLUTION LEVEL 1: Direct filesystem check for workspace-relative path.
 * Fastest resolution path; skipped only if file does not exist.
 */
async function tryDirectFilesystem(
  parsed: ParsedAddress,
  workspaceRoot: string,
): Promise<AddressResolutionResult | null> {
  try {
    const absolute = isAbsolute(parsed.path)
      ? parsed.path
      : join(workspaceRoot, parsed.path);
    const uri = Uri.file(absolute);
    await workspace.fs.stat(uri);
    return {
      kind: 'resolved',
      uri,
      range: buildRangeFromParsed(parsed),
    };
  } catch {
    // File does not exist; proceed to fallback levels
    return null;
  }
}

/**
 * RESOLUTION LEVEL 2: Glob search for exact relative path match.
 * Finds all files matching the parsed path pattern.
 * If unique, returns immediately; if ambiguous, returns candidates.
 */
async function tryExactPathGlob(
  parsed: ParsedAddress,
  workspaceRoot: string,
): Promise<AddressResolutionResult | null> {
  try {
    const pattern = toPosixPath(`**/${parsed.path}`);
    const results = await findFiles({
      baseDirectoryPath: workspaceRoot,
      baseDirectoryUri: Uri.file(workspaceRoot),
      includeFilePatterns: [pattern],
      excludedPatterns: [],
      maxResults: 10,
    });

    if (!results || results.length === 0) {
      return null;
    }

    if (results.length === 1) {
      return {
        kind: 'resolved',
        uri: results[0],
        range: buildRangeFromParsed(parsed),
      };
    }

    // Multiple matches: try to prefer exact suffix match
    const requestedPosix = toPosixPath(parsed.path).replace(/^\/*/, '');
    const exactMatch = results.find((r) =>
      toPosixPath(r.fsPath).endsWith(requestedPosix),
    );

    if (exactMatch) {
      return {
        kind: 'resolved',
        uri: exactMatch,
        range: buildRangeFromParsed(parsed),
      };
    }

    // Return candidates for user to disambiguate
    return {
      kind: 'ambiguous',
      candidates: results,
      range: buildRangeFromParsed(parsed),
    };
  } catch {
    // Glob failed; proceed to fallback
    return null;
  }
}

/**
 * RESOLUTION LEVEL 3: Glob search by basename (filename only).
 * Loose matching fallback for cases where relative path is unknown.
 * Prefers exact suffix matches; returns candidates if ambiguous.
 */
async function tryBasenameGlob(
  parsed: ParsedAddress,
  workspaceRoot: string,
): Promise<AddressResolutionResult | null> {
  try {
    const basename_ = basename(parsed.path);
    const pattern = toPosixPath(`**/${basename_}`);
    const results = await findFiles({
      baseDirectoryPath: workspaceRoot,
      baseDirectoryUri: Uri.file(workspaceRoot),
      includeFilePatterns: [pattern],
      excludedPatterns: [],
      maxResults: 20,
    });

    if (!results || results.length === 0) {
      return null;
    }

    // Prefer exact suffix match based on requested path
    const requestedPosix = toPosixPath(parsed.path).replace(/^\/*/, '');
    const bestMatch = results.find((r) =>
      toPosixPath(r.fsPath).endsWith(requestedPosix),
    );

    if (bestMatch) {
      return {
        kind: 'resolved',
        uri: bestMatch,
        range: buildRangeFromParsed(parsed),
      };
    }

    // Return single result or candidates
    if (results.length === 1) {
      return {
        kind: 'resolved',
        uri: results[0],
        range: buildRangeFromParsed(parsed),
      };
    }

    return {
      kind: 'ambiguous',
      candidates: results,
      range: buildRangeFromParsed(parsed),
    };
  } catch {
    // Glob failed; no more fallbacks
    return null;
  }
}

/**
 * Convert parsed address values (1-based) to editor Range (0-based).
 *
 * NOTE: Anchor hints are parsed and preserved but navigation remains
 * locality-oriented at runtime.
 */
function buildRangeFromParsed(parsed: ParsedAddress): Range | undefined {
  if (!parsed) {
    return undefined;
  }

  if (parsed.kind === 'anchor') {
    const line0 = Math.max(0, parsed.line - 1);
    const col0 = parsed.column && parsed.column > 0 ? parsed.column - 1 : 0;
    const pos = new Position(line0, col0);
    return new Range(pos, pos);
  }

  if (parsed.kind === 'range') {
    const startLine0 = Math.max(0, parsed.startLine - 1);
    const endLine0 = Math.max(0, parsed.endLine - 1);
    const start = new Position(startLine0, 0);
    const end = new Position(endLine0, 0);
    return new Range(start, end);
  }

  // file kind -> no range
  return undefined;
}
