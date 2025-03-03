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
   * @public
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
    const text = document.getText();

    for (const rule of highlightRules) {
      const regex = new RegExp(`\\b${this.escapeRegExp(rule.keyword)}\\b`, 'g');
      const ranges: DecorationOptions[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text))) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        ranges.push({ range: new Range(startPos, endPos) });
      }
      if (ranges.length > 0) {
        decorations.push({ type: this.decorationTypes[rule.keyword], ranges });
      }
    }

    return decorations;
  }

  /**
   * Retrieves decorations for special highlight directives.
   * This method is called when the configuration changes.
   *
   * @function getSpecialHighlightDecorations
   * @public
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
   * @public
   * @memberof HighlightController
   * @example
   * const ranges = service.parseSpecialDirective(directive, document, lineIndex, lines);
   *
   * @param {string} directive - The directive string (e.g., "next line", "range 3-5")
   * @param {TextDocument} document - The document containing the directive
   * @param {number} lineIndex - The line where the directive is found
   * @param {string[]} lines - The full list of lines in the document
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

  /**
   * Escapes a string to be safely used in a regular expression.
   * This method is used to escape special characters in keyword strings.
   *
   * @function escapeRegExp
   * @private
   * @memberof HighlightController
   * @example
   * const escaped = service.escapeRegExp(input);
   *
   * @param {string} input - The string to escape
   *
   * @returns {string} - The escaped string
   */
  private escapeRegExp(input: string): string {
    return input.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
