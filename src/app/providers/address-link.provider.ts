import {
  CancellationToken,
  DocumentLink,
  DocumentLinkProvider,
  Range,
  TextDocument,
  Uri,
} from 'vscode';

import { buildAnnotationTagRegex } from '../helpers';

/**
 * Detected address reference within document text.
 * Positions use byte offsets into document (0-based).
 */
interface AddressMatch {
  value: string; // The address string (e.g., "src/file.ts#10")
  start: number; // Byte offset where address starts
  end: number; // Byte offset where address ends
}

const FRONTMATTER_PATTERN = /^\ufeff?\s*---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;

const extractProjectFrontmatterHint = (text: string): string | undefined => {
  const match = FRONTMATTER_PATTERN.exec(text);

  if (!match) {
    return undefined;
  }

  const frontmatterBody = match[1];
  const lines = frontmatterBody.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(':');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();

    if (key !== 'project') {
      continue;
    }

    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!value) {
      return undefined;
    }

    return stripQuotes(value);
  }

  return undefined;
};

const stripQuotes = (value: string): string => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }

  return value;
};

/**
 * DocumentLinkProvider that detects address references in markdown and plaintext documents.
 *
 * Extraction flow (in order):
 * 1. Find tag-style addresses: TODO(path), FIXME(path), NOTE(path), HACK(path)
 * 2. Find inline addresses: path[#line], path[#start-end], path[#line:hint]
 *
 * Each detected address becomes a DocumentLink pointing to codeMarkPlus.openAddress command.
 *
 * RESPONSIBILITY: Extract address references and create editor-native link affordances.
 *
 * DOES NOT: Resolve paths, navigate UI, validate targets, or perform I/O.
 *
 * This separation ensures the provider remains lightweight, deterministic, and composable.
 */
export class AddressLinkProvider implements DocumentLinkProvider {
  private readonly tagKeywords?: string[];

  constructor(tagKeywords?: string[]) {
    this.tagKeywords = Array.isArray(tagKeywords) ? tagKeywords : undefined;
  }
  /**
   * Detect all address references in a document.
   * Returns DocumentLinks for each reference.
   */
  provideDocumentLinks(
    document: TextDocument,
    _token: CancellationToken,
  ): DocumentLink[] {
    const text = document.getText();
    const projectHint = extractProjectFrontmatterHint(text);

    // Deterministic inline and tag patterns are used.
    // TagPattern is derived locally from provided `tagKeywords` when available
    // to preserve runtime-driven, distributed authority. If no keywords were
    // provided, fall back to the legacy hard-coded set for historical
    // compatibility.
    const MinimalPattern = /([\w\-./]+\.[\w]+(?:#\d+(?:-\d+|:\d+)?)?)/g;

    const TagPattern = buildAnnotationTagRegex(
      this.tagKeywords && this.tagKeywords.length > 0
        ? this.tagKeywords.map((k) => String(k).trim()).filter(Boolean)
        : undefined,
    );

    const links: DocumentLink[] = [];
    const seen = new Set<string>();
    const occupiedRanges: Array<{ start: number; end: number }> = [];

    const addMatch = (value: string, start: number, end: number) => {
      const key = `${start}:${end}:${value}`;

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      occupiedRanges.push({ start, end });
      links.push(
        this.createDocumentLink(document, { value, start, end }, projectHint),
      );
    };

    const isCoveredByTag = (start: number, end: number) =>
      occupiedRanges.some((range) => start >= range.start && end <= range.end);

    for (const m of text.matchAll(TagPattern)) {
      if (!m || m.index === undefined) {
        continue;
      }

      addMatch(m[0], m.index, m.index + m[0].length);
    }

    // Simple deterministic extraction using MINIMAL_PATTERN
    for (const m of text.matchAll(MinimalPattern)) {
      const value = m[1];

      if (!value || m.index === undefined) {
        continue;
      }

      const start = m.index + m[0].indexOf(value);

      if (isCoveredByTag(start, start + value.length)) {
        continue;
      }

      addMatch(value, start, start + value.length);
    }

    return links;
  }

  /**
   * Create DocumentLink from address match.
   * Link target is codeMarkPlus.openAddress command with encoded address argument.
   */
  private createDocumentLink(
    document: TextDocument,
    match: AddressMatch,
    projectHint?: string,
  ): DocumentLink {
    const range = new Range(
      document.positionAt(match.start),
      document.positionAt(match.end),
    );

    const args: unknown[] = [match.value];

    if (projectHint) {
      args.push({ project: projectHint });
    }

    const payload = JSON.stringify(args);

    const commandArguments = encodeURIComponent(payload);

    const target = Uri.parse(
      `command:codeMarkPlus.openAddress?${commandArguments}`,
    );

    return new DocumentLink(range, target);
  }
}
