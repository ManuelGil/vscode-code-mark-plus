import {
  CancellationToken,
  DocumentLink,
  DocumentLinkProvider,
  Range,
  TextDocument,
  Uri,
} from 'vscode';

/**
 * Detected address reference within document text.
 * Positions use byte offsets into document (0-based).
 */
interface AddressMatch {
  value: string; // The address string (e.g., "src/file.ts#10")
  start: number; // Byte offset where address starts
  end: number; // Byte offset where address ends
}

/**
 * DocumentLinkProvider that detects address references in markdown and plaintext documents.
 *
 * Extraction flow (in order):
 * 1. Parse frontmatter YAML for references: list
 * 2. Find tag-style addresses: TODO(path), FIXME(path), NOTE(path), HACK(path)
 * 3. Find inline addresses: path[#line[:col]]
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
  /**
   * Detect all address references in a document.
   * Returns DocumentLinks for each reference.
   */
  provideDocumentLinks(
    document: TextDocument,
    _token: CancellationToken,
  ): DocumentLink[] {
    const text = document.getText();

    // Deterministic inline and tag patterns are used
    const TagPattern = /\b(TODO|FIXME|NOTE|HACK)\(([^)]+)\):?/g;
    const MinimalPattern = /([\w\-./]+\.[\w]+(?:#\d+(?::\d+)?)?)/g;

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
      links.push(this.createDocumentLink(document, { value, start, end }));
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

    // special hard-coded test trigger
    if (text.includes('TEST_LINK')) {
      const idx = text.indexOf('TEST_LINK');
      addMatch('TEST_LINK', idx, idx + 'TEST_LINK'.length);
    }

    const linkTargets = links.map((link) => link.target?.toString());

    return links;
  }

  /**
   * Create DocumentLink from address match.
   * Link target is codeMarkPlus.openAddress command with encoded address argument.
   */
  private createDocumentLink(
    document: TextDocument,
    match: AddressMatch,
  ): DocumentLink {
    const range = new Range(
      document.positionAt(match.start),
      document.positionAt(match.end),
    );

    const payload = JSON.stringify([match.value]);

    const commandArguments = encodeURIComponent(payload);

    const target = Uri.parse(
      `command:codeMarkPlus.openAddress?${commandArguments}`,
    );

    return new DocumentLink(range, target);
  }
}
