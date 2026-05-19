import { Range } from 'vscode';

import { CommentService } from '../services';
import { selectAnnotation } from './annotation.helper';

const CONTEXT_WINDOW = 10;

/**
 * Lightweight operational discovery mode enumeration.
 *
 * @enum
 */
export enum DiscoveryMode {
  File = 'file',
  Tag = 'tag',
  Range = 'range',
}

/**
 * Lightweight operational discovery workflow.
 *
 * RESPONSIBILITY:
 * - Discover annotations in resolved files
 * - Filter by tag or range
 * - Present selection UI
 * - Support graceful fallback
 *
 * DOES NOT:
 * - Resolve addresses
 * - Parse addresses
 * - Navigate files directly
 * - Manage runtime state
 *
 * Discovery workflow is fully stateless.
 * It requires explicit service injection.
 *
 * @export
 * @class AddressDiscoveryWorkflow
 */
export class AddressDiscoveryWorkflow {
  /**
   * Creates a new AddressDiscoveryWorkflow instance.
   *
   * @constructor
   * @param {CommentService} commentService - Comment domain service
   */
  constructor(readonly commentService: CommentService) {
    // constructor left intentionally minimal
  }

  /**
   * Execute file-scoped discovery.
   *
   * Discover all annotations in the provided file text.
   * If matches exist, present QuickPick selection.
   *
   * @async
   * @function discoverInFile
   * @public
   * @memberof AddressDiscoveryWorkflow
   *
   * @param {string} documentText - File contents
   * @param {string} [languageId] - VSCode language identifier
   *
   * @returns {Promise<{
   *   start: number;
   *   end: number;
   *   line: number;
   *   preview: string;
   *   fullText: string;
   *   tag?: string;
   * } | undefined>} - Selected annotation or undefined
   */
  async discoverInFile(
    documentText: string,
    languageId?: string,
  ): Promise<
    | {
        start: number;
        end: number;
        line: number;
        preview: string;
        fullText: string;
        tag?: string;
      }
    | undefined
  > {
    const annotations = this.commentService.findSingleLineComments(
      documentText,
      languageId,
    );

    if (annotations.length === 0) {
      return undefined;
    }

    const selected = await selectAnnotation(
      annotations,
      'Select annotation to navigate to',
    );

    return selected;
  }

  /**
   * Execute tag-scoped discovery.
   *
   * Discover annotations matching a specific tag.
   * If matches exist, present QuickPick selection.
   *
   * @async
   * @function discoverByTag
   * @public
   * @memberof AddressDiscoveryWorkflow
   *
   * @param {string} documentText - File contents
   * @param {string} tag - Annotation tag (TODO, FIXME, etc.)
   * @param {string} [languageId] - VSCode language identifier
   *
   * @returns {Promise<{
   *   start: number;
   *   end: number;
   *   line: number;
   *   preview: string;
   *   fullText: string;
   *   tag?: string;
   * } | undefined>} - Selected annotation or undefined
   */
  async discoverByTag(
    documentText: string,
    tag: string,
    range?: Range,
    isExplicitRange = false,
    languageId?: string,
  ): Promise<
    | {
        start: number;
        end: number;
        line: number;
        preview: string;
        fullText: string;
        tag?: string;
      }
    | undefined
  > {
    const all = this.commentService.findSingleLineComments(
      documentText,
      languageId,
    );

    const tagFiltered = all.filter((c) => c.tag === tag);

    let filtered = tagFiltered;

    if (range) {
      if (isExplicitRange) {
        // Strict deterministic filtering for explicit ranges
        const originalStart = range.start.line + 1;
        const originalEnd = range.end.line + 1;

        filtered = tagFiltered.filter(
          (comment) =>
            comment.line >= originalStart && comment.line <= originalEnd,
        );
      } else {
        // Anchor-style tag discovery: expand locality around anchor
        const lines = documentText.split(/\r?\n/);
        const maxLine = Math.max(0, lines.length - 1);
        const contextualStartLine = Math.max(
          0,
          range.start.line - CONTEXT_WINDOW,
        );
        const contextualEndLine = Math.min(
          maxLine,
          range.end.line + CONTEXT_WINDOW,
        );

        const ctxStart = contextualStartLine + 1;
        const ctxEnd = contextualEndLine + 1;

        filtered = tagFiltered.filter(
          (comment) => comment.line >= ctxStart && comment.line <= ctxEnd,
        );
      }
    }

    if (filtered.length === 0) {
      return undefined;
    }

    const selected = await selectAnnotation(
      filtered,
      `Select ${tag} annotation`,
    );

    return selected;
  }

  /**
   * Execute range-scoped discovery.
   *
   * Discover annotations within a resolved range.
   * If matches exist, present QuickPick selection.
   *
   * @async
   * @function discoverInRange
   * @public
   * @memberof AddressDiscoveryWorkflow
   *
   * @param {string} documentText - File contents
   * @param {Range} range - VSCode range for filtering
   * @param {string} [languageId] - VSCode language identifier
   *
   * @returns {Promise<{
   *   start: number;
   *   end: number;
   *   line: number;
   *   preview: string;
   *   fullText: string;
   *   tag?: string;
   * } | undefined>} - Selected annotation or undefined
   */
  async discoverInRange(
    documentText: string,
    range: Range,
    isExplicitRange = false,
    languageId?: string,
  ): Promise<
    | {
        start: number;
        end: number;
        line: number;
        preview: string;
        fullText: string;
        tag?: string;
      }
    | undefined
  > {
    const all = this.commentService.findSingleLineComments(
      documentText,
      languageId,
    );

    const lines = documentText.split(/\r?\n/);

    if (isExplicitRange) {
      // STRICT deterministic filtering: do not expand locality
      const originalStart = range.start.line + 1;
      const originalEnd = range.end.line + 1;

      const filtered = all.filter(
        (annotation) =>
          annotation.line >= originalStart && annotation.line <= originalEnd,
      );

      if (filtered.length === 0) {
        return undefined;
      }

      const selectedStrict = await selectAnnotation(
        filtered,
        'Select annotation in range',
      );

      return selectedStrict;
    }

    // ANCHOR mode: expand locality and find nearby annotations
    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const lineStartOffset = (lineIndex: number) => {
      let offset = 0;

      for (let i = 0; i < lineIndex; i++) {
        offset += lines[i].length + 1;
      }

      return offset;
    };

    const lineEndOffset = (lineIndex: number) =>
      lineStartOffset(lineIndex) + lines[lineIndex].length;

    const maxLine = Math.max(0, lines.length - 1);
    const contextualStartLine = clamp(
      range.start.line - CONTEXT_WINDOW,
      0,
      maxLine,
    );
    const contextualEndLine = clamp(
      range.end.line + CONTEXT_WINDOW,
      0,
      maxLine,
    );

    const rangeStartOffset = lineStartOffset(contextualStartLine);
    const rangeEndOffset = lineEndOffset(contextualEndLine);

    const filtered = all.filter(
      (c) => c.start >= rangeStartOffset && c.end <= rangeEndOffset,
    );

    if (filtered.length === 0) {
      return undefined;
    }

    const selected = await selectAnnotation(
      filtered,
      'Select annotation in range',
    );

    return selected;
  }
}
