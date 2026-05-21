/**
 * Handles TODO-related operations.
 * Extracted from Notes module to ensure separation of concerns.
 */
import { l10n, window } from 'vscode';
import { ContextWorkspaceService } from '../services';

/**
 * The ContextWorkspaceController class.
 *
 * @class
 * @classdesc The class that represents the todo controller.
 * @export
 * @public
 */
export class ContextWorkspaceController {
  constructor(
    private readonly contextWorkspaceService: ContextWorkspaceService,
  ) {
    // constructor left intentionally minimal
  }

  /**
   * The promoteSelectionToContextNote command handler.
   * Promote selected text or typed content into a contextual note.
   * @function promoteSelectionToContextNote
   * @private
   * @memberof ContextWorkspaceController
   * @example
   * await this.promoteSelectionToContextNote();
   *
   * @returns {Promise<void>} - A promise that resolves when the command completes
   */
  public async promoteSelectionToContextNote(): Promise<void> {
    try {
      // Get the selected text or prompt for content
      let content = '';
      let sourceFilePath: string | undefined;
      let sourceLine: number | undefined;
      let sourceCharacter: number | undefined;
      const editor = window.activeTextEditor;

      if (editor && !editor.selection.isEmpty) {
        // Use selected text
        content = editor.document.getText(editor.selection);
        sourceFilePath = editor.document.uri.fsPath;
        sourceLine = editor.selection.active.line + 1;
        sourceCharacter = editor.selection.active.character + 1;
      } else {
        // Prompt for content
        content =
          (await window.showInputBox({
            prompt: l10n.t('Enter contextual note content'),
            placeHolder: l10n.t('Contextual note'),
            validateInput: (value) => {
              return value && value.trim().length > 0
                ? null
                : l10n.t('Note content cannot be empty');
            },
          })) || '';

        if (!content) {
          return; // User canceled
        }

        if (editor) {
          sourceFilePath = editor.document.uri.fsPath;
          sourceLine = editor.selection.active.line + 1;
          sourceCharacter = editor.selection.active.character + 1;
        }
      }

      // Promote to a contextual note
      const success = await this.contextWorkspaceService.promoteToContextNote(
        content,
        {
          filePath: sourceFilePath || '',
          line: sourceLine,
          character: sourceCharacter,
        },
      );

      if (success) {
        window.showInformationMessage(l10n.t('Saved contextual note'));
      } else {
        window.showErrorMessage(
          l10n.t('Failed to promote mark to contextual note'),
        );
      }
    } catch (error) {
      console.error(
        '[CodeMark+] Runtime failure in promoteSelectionToContextNote',
        error,
      );
      window.showErrorMessage(
        l10n.t('An error occurred while creating the contextual note'),
      );
    }
  }

  /**
   * @deprecated Use promoteSelectionToContextNote instead.
   */
  public async appendToTodoFile(): Promise<void> {
    await this.promoteSelectionToContextNote();
  }
}
