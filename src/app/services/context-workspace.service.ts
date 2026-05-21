/**
 * Handles workspace context operations.
 * Preserves legacy TODO semantics as a compatibility layer.
 */
import { relative } from 'path';
import { Uri, workspace } from 'vscode';

import { ExtensionConfig } from '../configs';
import { getWorkspaceRoot, saveFile } from '../helpers';

export interface ContextSourceReference {
  filePath: string;
  line?: number;
  character?: number;
  tag?: string;
}

/**
 * The ContextWorkspaceService class.
 *
 * @class
 * @classdesc The class that represents the contextual workspace service.
 * @export
 * @public
 */
export class ContextWorkspaceService {
  private contextDir: Uri | null = null;
  private metaDir: Uri | null = null;
  private notesDir: Uri | null = null;

  constructor(readonly config: ExtensionConfig) {}

  async initializeContextDirectory(): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(this.config);
    if (!workspaceRoot) {
      return;
    }

    this.contextDir = Uri.joinPath(
      Uri.file(workspaceRoot),
      this.config.contextFolder,
    );
    this.metaDir = Uri.joinPath(this.contextDir, 'meta');
    this.notesDir = Uri.joinPath(this.contextDir, 'notes');

    try {
      await workspace.fs.createDirectory(this.contextDir);
      await workspace.fs.createDirectory(this.metaDir);
      await workspace.fs.createDirectory(this.notesDir);
    } catch (error) {
      this.contextDir = null;
      this.metaDir = null;
      this.notesDir = null;
      console.error('Error initializing context directory:', error);
    }
  }

  async initializeNotesDirectory(): Promise<void> {
    await this.initializeContextDirectory();
  }

  async appendToTodoFile(
    content: string,
    source?: ContextSourceReference,
  ): Promise<boolean> {
    return this.promoteToContextNote(content, source);
  }

  async promoteToContextNote(
    content: string,
    source?: ContextSourceReference,
  ): Promise<boolean> {
    if (!this.notesDir) {
      await this.initializeContextDirectory();
      if (!this.notesDir) {
        return false;
      }
    }

    try {
      const relativeDirPath = this.getContextRelativeDirPath(this.notesDir);
      if (relativeDirPath === null) {
        console.error('No workspace folder found');
        return false;
      }

      const notePath = this.buildNotePath(source);
      const noteContent = this.buildPromotedNoteContent(content, source);

      await saveFile(relativeDirPath, notePath, noteContent, this.config);

      return true;
    } catch (error) {
      console.error('Error promoting context note:', error);
      return false;
    }
  }

  private getContextRelativeDirPath(directory: Uri): string | null {
    const workspaceRoot = getWorkspaceRoot(this.config, directory);
    if (!workspaceRoot) {
      return null;
    }

    return relative(workspaceRoot, directory.fsPath);
  }

  private buildNotePath(source?: ContextSourceReference): string {
    if (!source?.filePath) {
      return `general/${this.buildTimestampSlug()}.md`;
    }

    const workspaceRoot = getWorkspaceRoot(this.config);
    const sourcePath = workspaceRoot
      ? relative(workspaceRoot, source.filePath)
      : source.filePath;

    const normalizedSourcePath = sourcePath.replace(/\\/g, '/');
    const sourceSegments = normalizedSourcePath.split('/').filter(Boolean);
    const fileBaseName =
      sourceSegments
        .pop()
        ?.replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'mark';

    const directoryPath = sourceSegments.join('/');
    const lineSuffix = source.line ? `-L${source.line}` : '';
    const fileName = `${fileBaseName}${lineSuffix}.md`;

    if (!directoryPath) {
      return fileName;
    }

    return `${directoryPath}/${fileName}`;
  }

  private buildPromotedNoteContent(
    content: string,
    source?: ContextSourceReference,
  ): string {
    const trimmedContent = content.trim();

    if (!source?.filePath) {
      return trimmedContent;
    }

    const workspaceRoot = getWorkspaceRoot(this.config);
    const sourcePath = workspaceRoot
      ? relative(workspaceRoot, source.filePath)
      : source.filePath;
    const anchor = source.line
      ? source.character
        ? `#L${source.line}:${source.character}`
        : `#L${source.line}`
      : '';
    const lines: string[] = [];

    if (trimmedContent) {
      lines.push(trimmedContent, '');
    }

    lines.push(`See: [${sourcePath}${anchor}](${sourcePath}${anchor})`);

    if (source.tag) {
      lines.push(`${source.tag}(${sourcePath}${anchor})`);
    }

    return lines.join('\n');
  }

  private buildTimestampSlug(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }
}
