/**
 * Handles TODO-related operations.
 * Extracted from Notes module to ensure separation of concerns.
 */
import { relative } from 'path';
import { Uri, workspace } from 'vscode';

import { ExtensionConfig } from '../configs';
import { getWorkspaceRoot, readFileContent, saveFile } from '../helpers';

/**
 * The TodoService class.
 *
 * @class
 * @classdesc The class that represents the todo service.
 * @export
 * @public
 */
export class TodoService {
  private notesDir: Uri | null = null;

  constructor(readonly config: ExtensionConfig) {}

  async initializeNotesDirectory(): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(this.config);
    if (!workspaceRoot) {
      return;
    }

    this.notesDir = Uri.joinPath(
      Uri.file(workspaceRoot),
      this.config.notesFolder,
    );

    try {
      if (this.config.createDefaultFiles) {
        // Create the notes directory only when a command explicitly needs it.
        await workspace.fs.createDirectory(this.notesDir);
        await this.createDefaultFiles();

        return;
      }

      await workspace.fs.stat(this.notesDir);
    } catch (error) {
      this.notesDir = null;
      console.error('Error initializing notes directory:', error);
    }
  }

  async appendToTodoFile(content: string): Promise<boolean> {
    if (!this.notesDir) {
      await this.initializeNotesDirectory();
      if (!this.notesDir) {
        return false;
      }
    }

    const todoFileUri = Uri.joinPath(this.notesDir, this.config.todoFileName);

    try {
      const relativeDirPath = this.getNotesRelativeDirPath();
      if (relativeDirPath === null) {
        console.error('No workspace folder found');
        return false;
      }
      const todoFileName = this.config.todoFileName;

      // Create file if it doesn't exist
      let currentContent = '';
      try {
        await workspace.fs.stat(todoFileUri);
        currentContent = await readFileContent(todoFileUri);
      } catch {
        // File doesn't exist, will be created with initial content
        currentContent = '# TODO\n\n';
      }

      // Get the current date and time
      const now = new Date();
      const timestamp = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');

      // Append content with timestamp
      const formattedContent = `\n## Captured on ${timestamp}\n\n${content}\n`;
      const newContent = currentContent + formattedContent;

      await saveFile(relativeDirPath, todoFileName, newContent, this.config);

      return true;
    } catch (error) {
      console.error('Error appending to todo file:', error);
      return false;
    }
  }

  getTodoFilePath(): string | null {
    return this.getNotesFilePath(this.config.todoFileName);
  }

  private getNotesFilePath(filename: string): string | null {
    if (!this.notesDir) {
      return null;
    }

    return Uri.joinPath(this.notesDir, filename).fsPath;
  }

  private async createDefaultFiles(): Promise<void> {
    if (!this.notesDir) {
      return;
    }

    const relativeDirPath = this.getNotesRelativeDirPath();
    if (relativeDirPath === null) {
      console.error('No workspace folder found');
      return;
    }

    const createFileIfNotExists = async (
      fileName: string,
      content: string,
    ): Promise<void> => {
      try {
        const fileUri = Uri.joinPath(this.notesDir!, fileName);
        try {
          await workspace.fs.stat(fileUri);
          // File already exists, skip creation
        } catch {
          // File doesn't exist, create it using saveFile helper
          await saveFile(relativeDirPath, fileName, content, this.config);
        }
      } catch (error) {
        console.error(`Error creating file ${fileName}:`, error);
      }
    };

    // Create default files in parallel
    await Promise.all([
      // Create todo file
      createFileIfNotExists(
        this.config.todoFileName,
        [
          '# TODO',
          '',
          'Pending tasks, refactors, follow-ups, and reminders.',
          '',
          '## Today',
          '',
          '- ',
          '',
          '## Later',
          '',
          '- ',
          '',
        ].join('\n'),
      ),

      // Create scratchpad file
      createFileIfNotExists(
        this.config.scratchpadFileName,
        [
          '# Scratchpad',
          '',
          'Quick thoughts, debugging notes, temporary ideas, and anything worth keeping nearby.',
          '',
          '---',
          '',
        ].join('\n'),
      ),
    ]);
  }

  private getNotesRelativeDirPath(): string | null {
    if (!this.notesDir) {
      return null;
    }

    const workspaceRoot = getWorkspaceRoot(this.config, this.notesDir);
    if (!workspaceRoot) {
      return null;
    }

    return relative(workspaceRoot, this.notesDir.fsPath);
  }
}
