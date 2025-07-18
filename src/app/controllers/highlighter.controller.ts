import {
  DecorationOptions,
  DecorationRenderOptions,
  Range,
  TextDocument,
  TextEditor,
  TextEditorDecorationType,
  window,
} from 'vscode';

import { ExtensionConfig } from '../configs';
import { escapeRegExp } from '../helpers';

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
  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB limit

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
   * @memberof Highlight
   * @example
   * this.specialDecoration = TextEditorDecorationType
   */
  private specialDecoration!: TextEditorDecorationType;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the CommentService class
   *
   * @constructor
   * @param {ExtensionConfig} config - The configuration object
   * @public
   * @memberof CommentService
   * @example
   * const service = new CommentService(config);
   *
   * @returns {CommentService} - A new instance of the CommentService class
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
   * This method is called when the configuration changes.
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
    if (!editor) {
      return;
    }

    this.clearHighlighting(editor);

    // Check file size to avoid performance issues with large files
    const fileSize = editor.document.getText().length;
    if (fileSize > this.MAX_FILE_SIZE) {
      // For large files, we apply limited highlighting or skip it entirely
      window.setStatusBarMessage(
        `CodeMark+: Limited highlighting applied (file size: ${Math.round(fileSize / 1024)}KB exceeds limit)`,
        5000,
      );
      return;
    }

    const decorations = this.getHighlightDecorations(editor.document);

    for (const deco of decorations) {
      editor.setDecorations(deco.type, deco.ranges);
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

    // Clear decorations for keyword rules.
    for (const key in this.decorationTypes) {
      editor.setDecorations(this.decorationTypes[key], []);
    }

    // Clear special decoration.
    if (this.specialDecoration) {
      editor.setDecorations(this.specialDecoration, []);
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
    // Dispose existing keyword decorations.
    Object.keys(this.decorationTypes).forEach((key) =>
      this.decorationTypes[key].dispose(),
    );
    this.createDecorationTypes();
    this.createSpecialDecoration();
  }

  /**
   * Retrieves all highlight decorations in the document, including both keyword
   * and special highlight decorations.
   *
   * @function getHighlightDecorations
   * @public
   * @memberof HighlightController
   * @example
   * const decorations = service.getHighlightDecorations(document);
   *
   * @param {TextDocument} document - The document to analyze
   *
   * @returns {{ type: TextEditorDecorationType; ranges: DecorationOptions[]; }[]} - A list of decoration objects with type and range
   */
  getHighlightDecorations(document: TextDocument): {
    type: TextEditorDecorationType;
    ranges: DecorationOptions[];
  }[] {
    const keywordDecorations = this.getKeywordDecorations(document);
    const specialDecorations = this.getSpecialHighlightDecorations(document);
    return [...keywordDecorations, ...specialDecorations];
  }

  // Private methods

  /**
   * Retrieves decorations for configured highlight keywords.
   * This method is called when the configuration changes.
   *
   * @function getKeywordDecorations
   * @private
   * @memberof HighlightController
   * @example
   * const decorations = service.getKeywordDecorations(document);
   *
   * @param {TextDocument} document - The document to analyze
   *
   * @returns {{ type: TextEditorDecorationType; ranges: DecorationOptions[]; }[]} - A list of decoration objects with type and range
   */
  private getKeywordDecorations(document: TextDocument): {
    type: TextEditorDecorationType;
    ranges: DecorationOptions[];
  }[] {
    const { highlightRules } = this.config;

    const decorations: {
      type: TextEditorDecorationType;
      ranges: DecorationOptions[];
    }[] = [];

    // Avoid excessive processing for very large files
    const text = document.getText();

    try {
      // Limit the number of decorations per keyword to avoid performance issues
      const MAX_DECORATIONS_PER_KEYWORD = 1000;

      for (const rule of highlightRules) {
        // Skip processing if the rule doesn't have a valid keyword
        if (!rule.keyword || typeof rule.keyword !== 'string') {
          continue;
        }

        const regex = new RegExp(`\\b${escapeRegExp(rule.keyword)}\\b`, 'g');
        const ranges: DecorationOptions[] = [];
        let match: RegExpExecArray | null;

        // Count matches to avoid excessive decorations
        let matchCount = 0;

        while ((match = regex.exec(text))) {
          // Limit the number of decorations for performance
          if (matchCount >= MAX_DECORATIONS_PER_KEYWORD) {
            window.setStatusBarMessage(
              `CodeMark+: Too many occurrences of "${rule.keyword}". Limiting to ${MAX_DECORATIONS_PER_KEYWORD} for performance.`,
              5000,
            );
            break;
          }

          const startPos = document.positionAt(match.index);
          const endPos = document.positionAt(match.index + match[0].length);
          ranges.push({ range: new Range(startPos, endPos) });
          matchCount++;
        }

        if (ranges.length > 0 && this.decorationTypes[rule.keyword]) {
          decorations.push({
            type: this.decorationTypes[rule.keyword],
            ranges,
          });
        }
      }
    } catch (error) {
      // Gracefully handle errors during keyword parsing
      console.error('Error while processing highlight keywords:', error);
    }

    return decorations;
  }

  /**
   * Retrieves decorations for special highlight directives.
   * This method is called when the configuration changes.
   *
   * @function getSpecialHighlightDecorations
   * @private
   * @memberof HighlightController
   * @example
   * const decorations = service.getSpecialHighlightDecorations(document);
   *
   * @param {TextDocument} document - The document to analyze
   *
   * @returns {{ type: TextEditorDecorationType; ranges: DecorationOptions[]; }[]} - A list of decoration objects with type and range
   */
  private getSpecialHighlightDecorations(document: TextDocument): {
    type: TextEditorDecorationType;
    ranges: DecorationOptions[];
  }[] {
    const specialRanges: DecorationOptions[] = [];
    const text = document.getText();
    const lines = text.split('\n');
    const directiveRegex = /\/\/\s*HIGHLIGHT:\s*(.+)/i;

    for (let i = 0; i < lines.length; i++) {
      const match = directiveRegex.exec(lines[i]);
      if (match) {
        const directive = match[1].trim();
        const ranges = this.parseSpecialDirective(
          directive,
          document,
          i,
          lines,
        );
        specialRanges.push(...ranges);
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
        .map((n) => parseInt(n, 10) - 1);
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
    const { highlightRules } = this.config;

    for (const key in this.decorationTypes) {
      this.decorationTypes[key].dispose();
    }
    this.decorationTypes = {};

    for (const rule of highlightRules) {
      this.decorationTypes[rule.keyword] = this.createDecoration({
        backgroundColor: rule.color,
        fontWeight: rule.bold ? 'bold' : 'normal',
        textDecoration: rule.underline ? 'underline' : 'none',
        fontStyle: rule.italic ? 'italic' : 'normal',
        borderRadius: '3px',
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
    const { specialHighlightDecoration } = this.config;

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
