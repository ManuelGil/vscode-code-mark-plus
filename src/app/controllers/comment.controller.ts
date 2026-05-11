import {
  commands,
  DocumentSymbol,
  l10n,
  Position,
  Range,
  SymbolKind,
  TextEditor,
  Uri,
  window,
} from 'vscode';

import {
  escapeRegExp,
  getNormalizedHighlightRules,
  relativePath,
} from '../helpers';
import { CommentService } from '../services';
import { CommentData } from '../types';

/**
 * The FunctionInfo interface.
 */
interface FunctionInfo {
  name: string;
  parameters?: string;
  returnType?: string;
  signature?: string;
  modifiers?: string;
  range: Range;
}

/**
 * The CommentController class.
 *
 * @class
 * @classdesc The class that represents the list files controller.
 * @export
 * @public
 * @memberof controllers
 * @example
 * const controller = new CommentController(config);
 * controller.insertTextInActiveEditor();
 *
 * @property {CommentService} service - The comment service
 *
 * @returns {CommentController} - The comment controller
 */
export class CommentController {
  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the CommentController class
   *
   * @constructor
   * @param {CommentService} service - The comment service
   * @public
   * @memberof CommentController
   */
  constructor(readonly service: CommentService) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The exportToActiveTextEditor method.
   * Generate a file tree in the selected folder and insert it into the active editor.
   * @function exportToActiveTextEditor
   * @public
   * @async
   * @memberof CommentController
   * @example
   * controller.exportToActiveTextEditor(folderPath);
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async insertTextInActiveEditor(): Promise<void> {
    try {
      const { useCurrentPosition, author, version, license } =
        this.service.config;

      const editor = window.activeTextEditor;

      if (!editor) {
        window.showErrorMessage(l10n.t('No active editor available!'));
        return;
      }

      const document = editor.document;
      const position = editor.selection.active;
      const fileName = document.fileName;

      const functionInfo = await this.getFunctionInfo(editor);

      let indent = '';
      let insertPosition: Position;

      if (useCurrentPosition || !functionInfo) {
        indent = ' '.repeat(
          document.lineAt(position.line).firstNonWhitespaceCharacterIndex,
        );

        insertPosition = new Position(position.line, 0);
      } else {
        indent = ' '.repeat(
          document.lineAt(functionInfo.range.start.line)
            .firstNonWhitespaceCharacterIndex,
        );

        insertPosition = new Position(functionInfo.range.start.line, 0);
      }

      const docComment = await this.service.generateCommentSnippet({
        indent: indent,
        languageId: document.languageId,
        fileName: await relativePath(
          Uri.file(fileName),
          false,
          this.service.config,
        ),
        functionName: functionInfo?.name || 'Unknown',
        signature: functionInfo?.signature || 'N/A',
        modifiers: functionInfo?.modifiers || 'N/A',
        parameters: functionInfo?.parameters || 'None',
        returnType: functionInfo?.returnType || 'void',
        date: new Date().toLocaleDateString(),
        author,
        version,
        license,
      } as CommentData);

      editor.edit((editBuilder) => {
        editBuilder.insert(insertPosition, docComment);
      });
    } catch (error) {
      console.error('Error inserting comment:', error);
      window.showErrorMessage(
        l10n.t('An unexpected error occurred while inserting the comment'),
      );
    }
  }

  /**
   * The removeSingleLineComments method.
   * Remove single-line comments from the active text editor.
   * @function removeSingleLineComments
   * @public
   * @async
   * @memberof CommentController
   * @example
   * controller.removeSingleLineComments();
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async removeSingleLineComments(): Promise<void> {
    try {
      const editor = window.activeTextEditor;

      if (!editor) {
        window.showErrorMessage(l10n.t('No active editor available!'));
        return;
      }

      const documentText = editor.document.getText();

      const comments = this.service.findSingleLineComments(
        documentText,
        editor.document.languageId,
      );
      if (comments.length === 0) {
        window.showInformationMessage(
          l10n.t('No annotation comments found to clean'),
        );
        return;
      }

      const picks = comments.map((comment) => ({
        label: l10n.t('Line {0}: {1}', String(comment.line), comment.preview),
        description: comment.fullText,
        comment,
      }));

      const selected = await window.showQuickPick(picks, {
        canPickMany: true,
        placeHolder: l10n.t('Select annotation comments to clean'),
      });
      if (!selected || selected.length === 0) {
        window.showInformationMessage(
          l10n.t('No annotation comments selected'),
        );
        return;
      }

      await editor.edit((editBuilder) => {
        const sorted = selected.sort(
          (leftPick, rightPick) =>
            rightPick.comment.line - leftPick.comment.line,
        );
        sorted.forEach((item) => {
          const startPos = editor.document.positionAt(item.comment.start);
          const endPos = editor.document.positionAt(item.comment.end);

          const line = editor.document.lineAt(startPos.line);
          const lineText = line.text.trim();
          const commentText = editor.document
            .getText(new Range(startPos, endPos))
            .trim();

          if (lineText === commentText) {
            editBuilder.delete(line.rangeIncludingLineBreak);
          } else {
            const range = new Range(startPos, endPos);
            editBuilder.delete(range);
          }
        });
      });

      window.showInformationMessage(
        l10n.t('Selected annotation comments were cleaned'),
      );
    } catch (error) {
      console.error('Error removing comments:', error);
      window.showErrorMessage(
        l10n.t('An unexpected error occurred while removing comments'),
      );
    }
  }

  /**
   * The removeAllSingleLineComments method.
   * Remove all detected single-line comments from the active text editor without prompting.
   * @function removeAllSingleLineComments
   * @public
   * @async
   * @memberof CommentController
   * @example
   * controller.removeAllSingleLineComments();
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async removeAllSingleLineComments(): Promise<void> {
    try {
      const editor = window.activeTextEditor;

      if (!editor) {
        window.showErrorMessage(l10n.t('No active editor available!'));
        return;
      }

      const documentText = editor.document.getText();
      const comments = this.service.findSingleLineComments(
        documentText,
        editor.document.languageId,
      );

      if (comments.length === 0) {
        window.showInformationMessage(
          l10n.t('No annotation comments found to clean'),
        );
        return;
      }

      await editor.edit((editBuilder) => {
        // Sort descending to avoid shifting offsets as we delete
        const sorted = comments.sort(
          (leftComment, rightComment) => rightComment.start - leftComment.start,
        );
        sorted.forEach((comment) => {
          const startPos = editor.document.positionAt(comment.start);
          const endPos = editor.document.positionAt(comment.end);

          const line = editor.document.lineAt(startPos.line);
          const lineText = line.text.trim();
          const commentText = editor.document
            .getText(new Range(startPos, endPos))
            .trim();

          if (lineText === commentText) {
            // Entire line is a comment: remove the whole line including its line break
            editBuilder.delete(line.rangeIncludingLineBreak);
          } else {
            // Remove only the comment section
            editBuilder.delete(new Range(startPos, endPos));
          }
        });
      });

      window.showInformationMessage(
        l10n.t('All single-line annotation comments were cleaned'),
      );
    } catch (error) {
      console.error('Error removing all comments:', error);
      window.showErrorMessage(
        l10n.t('An unexpected error occurred while removing all comments'),
      );
    }
  }

  /**
   * The replaceAnnotationTagInSelection method.
   * Replace a selected annotation tag only within the active editor selection.
   * @function replaceAnnotationTagInSelection
   * @public
   * @async
   * @memberof CommentController
   * @example
   * controller.replaceAnnotationTagInSelection();
   *
   * @returns {Promise<void>} - The promise with no return value
   */
  async replaceAnnotationTagInSelection(): Promise<void> {
    try {
      const editor = window.activeTextEditor;

      if (!editor) {
        window.showErrorMessage(l10n.t('No active editor available!'));
        return;
      }

      if (editor.selection.isEmpty) {
        window.showInformationMessage(
          l10n.t('Select text first to replace annotation tags'),
        );
        return;
      }

      const document = editor.document;
      const selection = editor.selection;
      const selectionText = document.getText(selection);
      const annotationTagRules = this.getAnnotationTagRules(
        document.languageId,
      );

      if (annotationTagRules.length === 0) {
        window.showInformationMessage(
          l10n.t('No annotation tags found in the selection'),
        );
        return;
      }

      const sourceTags = annotationTagRules
        .filter(({ regex }) => {
          regex.lastIndex = 0;
          return regex.test(selectionText);
        })
        .map(({ tag }) => tag);

      if (sourceTags.length === 0) {
        window.showInformationMessage(
          l10n.t('No annotation tags found in the selection'),
        );
        return;
      }

      const sourceTag = await window.showQuickPick(sourceTags, {
        placeHolder: l10n.t('Select source tag'),
      });

      if (!sourceTag) {
        return;
      }

      const targetTags = annotationTagRules
        .map(({ tag }) => tag)
        .filter((tag) => tag !== sourceTag);

      if (targetTags.length === 0) {
        window.showInformationMessage(
          l10n.t('No replacement annotation tags available'),
        );
        return;
      }

      const targetTag = await window.showQuickPick(targetTags, {
        placeHolder: l10n.t('Select target tag'),
      });

      if (!targetTag) {
        return;
      }

      const sourceRule = annotationTagRules.find(
        ({ tag }) => tag === sourceTag,
      );
      if (!sourceRule) {
        window.showInformationMessage(
          l10n.t('No annotation tags found in the selection'),
        );
        return;
      }

      const selectionOffset = document.offsetAt(selection.start);
      const matches: Array<{ range: Range; replacement: string }> = [];

      sourceRule.regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = sourceRule.regex.exec(selectionText)) !== null) {
        const start = document.positionAt(selectionOffset + match.index);
        const end = document.positionAt(
          selectionOffset + match.index + match[0].length,
        );
        const suffix = match[0].endsWith(':') ? ':' : '';

        matches.push({
          range: new Range(start, end),
          replacement: `${targetTag}${suffix}`,
        });

        if (match[0].length === 0) {
          sourceRule.regex.lastIndex++;
        }
      }

      if (matches.length === 0) {
        window.showInformationMessage(
          l10n.t('No annotation tags found in the selection'),
        );
        return;
      }

      await editor.edit((editBuilder) => {
        const sorted = matches.sort((leftMatch, rightMatch) =>
          rightMatch.range.start.compareTo(leftMatch.range.start),
        );

        for (const item of sorted) {
          editBuilder.replace(item.range, item.replacement);
        }
      });

      window.showInformationMessage(
        l10n.t('Selected annotation tag was replaced within the selection'),
      );
    } catch (error) {
      console.error('Error replacing annotation tag:', error);
      window.showErrorMessage(
        l10n.t('An unexpected error occurred while replacing annotation tags'),
      );
    }
  }

  // Private methods

  private getAnnotationTagRules(
    languageId: string,
  ): Array<{ tag: string; regex: RegExp }> {
    const tagRules = new Map<string, { tag: string; regex: RegExp }>();

    for (const rule of getNormalizedHighlightRules(this.service.config)) {
      if (!rule.keyword) {
        continue;
      }

      if (rule.languageIds && rule.languageIds.length > 0) {
        if (!rule.languageIds.includes(languageId)) {
          continue;
        }
      }

      if (tagRules.has(rule.keyword)) {
        continue;
      }

      const escapedTag = escapeRegExp(rule.keyword);
      const source =
        rule.matchMode === 'substring'
          ? `${escapedTag}:?`
          : `\\b${escapedTag}\\b:?`;

      let flags = 'g';
      if (rule.caseSensitive === false) {
        flags += 'i';
      }

      tagRules.set(rule.keyword, {
        tag: rule.keyword,
        regex: new RegExp(source, flags),
      });
    }

    return [...tagRules.values()];
  }

  /**
   * The getFunctionInfo method.
   * Get the information about the function at the current cursor position.
   * @function getFunctionInfo
   * @private
   * @async
   * @memberof CommentController
   * @param {TextEditor} editor - The text editor
   * @example
   * const functionInfo = await this.getFunctionInfo(editor);
   * @returns {Promise<FunctionInfo | undefined>} - The promise with the function info or undefined
   */
  private async getFunctionInfo(
    editor: TextEditor,
  ): Promise<FunctionInfo | undefined> {
    const document = editor.document;
    const position = editor.selection.active;
    let symbols: DocumentSymbol[] | undefined;

    try {
      symbols = (await commands.executeCommand(
        'vscode.executeDocumentSymbolProvider',
        document.uri,
      )) as DocumentSymbol[];
    } catch (error) {
      console.error('Error getting function info:', error);
      return undefined; // Fail gracefully
    }

    if (!symbols) {
      return undefined;
    }

    function findFunctionSymbol(
      symbols: DocumentSymbol[],
    ): DocumentSymbol | undefined {
      for (const symbol of symbols) {
        if (symbol.range.contains(position)) {
          if (
            symbol.kind === SymbolKind.Function ||
            symbol.kind === SymbolKind.Method
          ) {
            return symbol;
          }
          const childResult = findFunctionSymbol(symbol.children);
          if (childResult) {
            return childResult;
          }
        }
      }
      return undefined;
    }

    const funcSymbol = findFunctionSymbol(symbols);
    if (!funcSymbol) {
      return undefined;
    }

    const functionText = document.getText(funcSymbol.range);
    const lines = functionText.split(/\r?\n/);
    const signature = lines[0].trim();

    const regex = /\(([^)]*)\)(?::\s*([^ {]+))?/;
    let parameters = '';
    let returnType = '';
    let match = funcSymbol.detail
      ? regex.exec(funcSymbol.detail)
      : regex.exec(signature);
    if (match) {
      parameters = match[1].trim();
      if (match[2]) {
        returnType = match[2].trim();
      }
    }

    const modifierRegex =
      /\b(async|static|public|private|protected|override)\b/g;
    const mods = signature.match(modifierRegex);
    const modifiers = mods ? mods.join(' ') : '';

    return {
      name: funcSymbol.name,
      parameters,
      returnType,
      signature,
      modifiers,
      range: funcSymbol.range,
    };
  }
}
