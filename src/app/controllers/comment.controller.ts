import {
  DocumentSymbol,
  Position,
  Range,
  SymbolKind,
  TextEditor,
  commands,
  l10n,
  window,
  workspace,
} from 'vscode';

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
    const {
      useCurrentPosition: useCurrentIndent,
      author,
      version,
      license,
    } = this.service.config;

    const editor = window.activeTextEditor;

    if (!editor) {
      const message = l10n.t('No active editor available!');
      window.showErrorMessage(message);
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const fileName = document.fileName;

    const functionInfo = await this.getFunctionInfo(editor);

    if (!functionInfo) {
      const message = l10n.t(
        'No function found at the current cursor position.',
      );
      window.showErrorMessage(message);
      return;
    }

    let indent = '';

    if (useCurrentIndent) {
      indent = ' '.repeat(
        document.lineAt(position.line).firstNonWhitespaceCharacterIndex,
      );
    } else {
      indent = ' '.repeat(
        document.lineAt(functionInfo.range.start.line)
          .firstNonWhitespaceCharacterIndex,
      );
    }

    const docComment = await this.service.generateCommentSnippet({
      indent: indent,
      fileName: workspace.asRelativePath(fileName),
      functionName: functionInfo.name,
      signature: functionInfo.signature || 'N/A',
      modifiers: functionInfo.modifiers || 'N/A',
      parameters: functionInfo.parameters || 'None',
      returnType: functionInfo.returnType || 'void',
      date: new Date().toLocaleDateString(),
      author,
      version,
      license,
    } as CommentData);

    const insertPosition = new Position(functionInfo.range.start.line, 0);

    editor.edit((editBuilder) => {
      editBuilder.insert(insertPosition, docComment);
    });
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
    const editor = window.activeTextEditor;

    if (!editor) {
      window.showErrorMessage('No active editor available!');
      return;
    }

    const documentText = editor.document.getText();

    const comments = this.service.findSingleLineComments(documentText);
    if (comments.length === 0) {
      window.showInformationMessage('No comments found for removal');
      return;
    }

    const picks = comments.map((comment) => ({
      label: `Line ${comment.line}: ${comment.preview}`,
      description: comment.fullText,
      comment,
    }));

    const placeHolder = 'Select comments to remove';
    const selected = await window.showQuickPick(picks, {
      canPickMany: true,
      placeHolder,
    });
    if (!selected || selected.length === 0) {
      window.showInformationMessage('No comments selected for removal');
      return;
    }

    await editor.edit((editBuilder) => {
      const sorted = selected.sort((a, b) => b.comment.line - a.comment.line);
      sorted.forEach((item) => {
        const startPos = editor.document.positionAt(item.comment.start);
        let endPos = editor.document.positionAt(item.comment.end);

        const nextCharRange = new Range(endPos, endPos.translate(0, 1));
        const nextChar = editor.document.getText(nextCharRange);
        if (nextChar === ';') {
          endPos = endPos.translate(0, 1);
        }

        const range = new Range(startPos, endPos);
        editBuilder.delete(range);
      });
    });

    window.showInformationMessage('Selected comments have been removed');
  }

  // Private methods

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

    const symbols = (await commands.executeCommand(
      'vscode.executeDocumentSymbolProvider',
      document.uri,
    )) as DocumentSymbol[];

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
