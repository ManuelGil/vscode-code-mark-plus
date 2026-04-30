import {
  l10n,
  Position,
  Range,
  Selection,
  TextEditorRevealType,
  Uri,
  window,
  workspace,
} from 'vscode';

import {
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  ExtensionConfig,
  TAG_BROWSER_MAX_FILE_SIZE_BYTES,
} from '../configs';
import {
  findFiles,
  getBaseName,
  getDirName,
  openDocument,
  relativePath,
  showNoWorkspaceFolderError,
  toPosixPath,
} from '../helpers';
import { NodeModel } from '../models';

/**
 * The TagBrowserController class.
 * Provides methods to find files with comments, open them and navigate to specific lines.
 *
 * @class TagBrowserController
 * @classdesc Manages the retrieval, opening and navigation of files with marked comments.
 * Facilitates the visualization of special comments within the source code.
 *
 * @example
 * const controller = new TagBrowserController(config);
 * const files = await controller.getFiles();
 *
 * @property {ExtensionConfig} config - The extension configuration
 */

export class TagBrowserController {
  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  constructor(readonly config: ExtensionConfig) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods
  /**
   * Retrieves a list of files in the workspace according to configured patterns.
   * Files are filtered according to inclusion/exclusion patterns defined in the configuration.
   * Shows an error message if there is no open workspace or if the operation is cancelled.
   *
   * @function getFiles
   * @async
   * @public
   * @memberof TagBrowserController
   * @example
   * const files = await controller.getFiles();
   * if (files && files.length > 0) {
   *   // Process found files
   * }
   *
   * @returns {Promise<NodeModel[] | void>} A promise that resolves to an array of NodeModel entries
   * representing files, or void when the operation is cancelled or no files are found.
   */
  async getFiles(): Promise<NodeModel[] | void> {
    // Get the files in the folder
    let folders: Uri[] = [];
    let files: Uri[] = [];

    if (!workspace.workspaceFolders) {
      showNoWorkspaceFolderError(EXTENSION_DISPLAY_NAME);
      return;
    }

    folders = workspace.workspaceFolders.map((folder) => folder.uri);

    const {
      includedFilePatterns,
      excludedFilePatterns,
      maxSearchRecursionDepth,
      supportsHiddenFiles,
      preserveGitignoreSettings,
      showFilePathInResults,
    } = this.config;

    const fileExtensionPatterns = Array.isArray(includedFilePatterns)
      ? includedFilePatterns
      : [includedFilePatterns];
    const fileExclusionPatterns = Array.isArray(excludedFilePatterns)
      ? excludedFilePatterns
      : [excludedFilePatterns];

    for (const folderUri of folders) {
      const result = await findFiles({
        baseDirectoryPath: folderUri.fsPath,
        baseDirectoryUri: folderUri,
        includeFilePatterns: fileExtensionPatterns,
        excludedPatterns: fileExclusionPatterns,
        disableRecursive: false, // allow recursive search; depth limited by maxSearchRecursionDepth
        maxRecursionDepth: maxSearchRecursionDepth,
        includeDotfiles: supportsHiddenFiles,
        enableGitignoreDetection: preserveGitignoreSettings,
        maxResults: Math.max(
          1,
          this.config?.performance?.maxFilesToIndex ?? 5000,
        ),
      });

      files.push(...result);
    }

    if (files.length !== 0) {
      const maximumFilesToIndex = Math.max(
        1,
        this.config?.maxFilesToIndex ?? 1000,
      );

      // Deterministic ordering before capping
      files.sort((leftFileUri, rightFileUri) =>
        leftFileUri.path.localeCompare(rightFileUri.path),
      );

      // Filter by size while honoring deterministic order and backfilling until cap is reached
      const eligibleFiles: Uri[] = [];
      for (const candidateUri of files) {
        if (eligibleFiles.length >= maximumFilesToIndex) {
          break;
        }
        try {
          const stat = await workspace.fs.stat(candidateUri);
          if (stat.size <= TAG_BROWSER_MAX_FILE_SIZE_BYTES) {
            eligibleFiles.push(candidateUri);
          }
        } catch {
          // If the file cannot be stat'd, skip it for safety
        }
      }

      const nodes: NodeModel[] = [];
      for (const fileUri of eligibleFiles) {
        const relPath = await relativePath(fileUri, false, this.config);
        const relNormalized = toPosixPath(relPath);
        const baseName = getBaseName(relNormalized);
        const dirName = getDirName(relNormalized);
        let fileName = baseName || l10n.t('Untitled');

        if (showFilePathInResults) {
          const folderDisplay = dirName && dirName !== '.' ? dirName : '';
          fileName = folderDisplay
            ? l10n.t('{0} ({1})', fileName, folderDisplay)
            : l10n.t('{0} (root)', fileName);
        }

        // Use resourceUri-based icon (native file icon) and attach helpful tooltip/context
        const node = new NodeModel(
          fileName ?? l10n.t('Untitled'),
          undefined,
          {
            command: `${EXTENSION_ID}.tagBrowserView.openFile`,
            title: l10n.t('Open Preview'),
            arguments: [fileUri],
          },
          fileUri,
          'file',
        );
        node.id = fileUri.fsPath;
        node.tooltip = fileUri.fsPath;
        nodes.push(node);
      }

      return nodes;
    }

    return [];
  }

  /**
   * Opens the specified file in the VS Code editor and optionally navigates to a line.
   *
   * @function openFile
   * @public
   * @memberof TagBrowserController
   * @example
   * // Open a selected file
   * controller.openFile(fileUri);
   * // Open a file and reveal line 10 (zero-based index 9)
   * controller.openFile(fileUri, 9);
   *
   * @param {Uri} fileUri - URI of the file to open in the editor.
   * @param {number} [lineNumber] - Optional zero-based line number to reveal.
   * @returns {Promise<void>} A promise that resolves when the file has been opened and the editor adjusted.
   */
  async openFile(fileUri: Uri, lineNumber?: number): Promise<void> {
    try {
      const editor = await openDocument(fileUri);
      const textDocument = editor.document;

      if (typeof lineNumber === 'number' && lineNumber >= 0) {
        const targetLine = Math.max(
          0,
          Math.min(lineNumber, textDocument.lineCount - 1),
        );
        const targetPosition = new Position(targetLine, 0);
        const targetRange = new Range(targetPosition, targetPosition);
        editor.selection = new Selection(targetPosition, targetPosition);
        editor.revealRange(targetRange, TextEditorRevealType.InCenter);
      }
    } catch (error) {
      const errorMessage = l10n.t('Unable to open file: {0}', String(error));
      window.showErrorMessage(errorMessage);
    }
  }
}
