/**
 * Handles TODO-related operations.
 * Extracted from Notes module to ensure separation of concerns.
 */
import { l10n, window } from 'vscode';
import { openDocument } from '../helpers';
import { TodoService } from '../services/todo.service';

/**
 * The TodoController class.
 *
 * @class
 * @classdesc The class that represents the todo controller.
 * @export
 * @public
 */
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * The appendToTodoFile command handler.
   * Append content to the todo file.
   * @function appendToTodoFile
   * @private
   * @memberof TodoController
   * @example
   * await this.appendToTodoFile();
   *
   * @returns {Promise<void>} - A promise that resolves when the command completes
   */
  public async appendToTodoFile(): Promise<void> {
    try {
      // Get the selected text or prompt for content
      let content = '';
      const editor = window.activeTextEditor;

      if (editor && !editor.selection.isEmpty) {
        // Use selected text
        content = editor.document.getText(editor.selection);
      } else {
        // Prompt for content
        content =
          (await window.showInputBox({
            prompt: l10n.t('Enter content to add to todo file'),
            placeHolder: l10n.t('Todo item content'),
            validateInput: (value) => {
              return value && value.trim().length > 0
                ? null
                : l10n.t('Content cannot be empty');
            },
          })) || '';

        if (!content) {
          return; // User canceled
        }
      }

      // Append to todo file
      const success = await this.todoService.appendToTodoFile(content);

      if (success) {
        window.showInformationMessage(l10n.t('Added to todo file'));

        // Ask if user wants to open the todo file
        const yes = l10n.t('Yes');
        const no = l10n.t('No');
        const openFile = await window.showInformationMessage(
          l10n.t('Content added to todo file. Open it now?'),
          yes,
          no,
        );

        if (openFile === yes) {
          await this.openTodoFile();
        }
      } else {
        window.showErrorMessage(l10n.t('Failed to add content to todo file'));
      }
    } catch (error) {
      console.error('Error appending to todo file:', error);
      window.showErrorMessage(
        l10n.t('An error occurred while updating the todo file'),
      );
    }
  }

  /**
   * The openTodoFile command handler.
   * Open the todo file.
   * @function openTodoFile
   * @private
   * @memberof TodoController
   * @example
   * await this.openTodoFile();
   *
   * @returns {Promise<void>} - A promise that resolves when the command completes
   */
  public async openTodoFile(): Promise<void> {
    try {
      await this.todoService.initializeNotesDirectory(false);

      const todoFilePath = this.todoService.getTodoFilePath();

      if (!todoFilePath) {
        window.showErrorMessage(l10n.t('Todo file path not available'));
        return;
      }

      await openDocument(todoFilePath);
    } catch (error) {
      console.error('Error opening todo file:', error);
      window.showErrorMessage(
        l10n.t('An error occurred while opening the todo file'),
      );
    }
  }
}
