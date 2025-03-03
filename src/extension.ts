// The module 'vscode' contains the VSCode extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Import the Configs, Controllers, and Providers
import {
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  EXTENSION_NAME,
  ExtensionConfig,
  USER_PUBLISHER,
} from './app/configs';
import { CommentController, HighlightController } from './app/controllers';
import { CommentService } from './app/services';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // The code you place here will be executed every time your command is executed
  let resource: vscode.WorkspaceFolder | undefined;

  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    // Check if there are workspace folders
    const message = vscode.l10n.t(
      'No workspace folders are open. Please open a workspace folder to use this extension',
    );
    vscode.window.showErrorMessage(message);
    return;
  }

  if (vscode.workspace.workspaceFolders.length === 1) {
    // Optionally, prompt the user to select a workspace folder if multiple are available
    resource = vscode.workspace.workspaceFolders[0];
  } else {
    const placeHolder = vscode.l10n.t(
      'Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
    );
    const selectedFolder = await vscode.window.showWorkspaceFolderPick({
      placeHolder,
    });

    resource = selectedFolder;
  }

  // -----------------------------------------------------------------
  // Initialize the extension
  // -----------------------------------------------------------------

  // Get the configuration for the extension
  const config = new ExtensionConfig(
    vscode.workspace.getConfiguration(EXTENSION_ID, resource?.uri),
  );

  // Watch for changes in the configuration
  vscode.workspace.onDidChangeConfiguration((event) => {
    const workspaceConfig = vscode.workspace.getConfiguration(
      EXTENSION_ID,
      resource?.uri,
    );

    if (
      event.affectsConfiguration(
        `${EXTENSION_ID}.highlightRules`,
        resource?.uri,
      ) ||
      event.affectsConfiguration(
        `${EXTENSION_ID}.specialHighlightDecoration`,
        resource?.uri,
      )
    ) {
      config.update(workspaceConfig);
      highlightController.refreshConfiguration();
      updateHighlighting();
    }

    if (event.affectsConfiguration(EXTENSION_ID, resource?.uri)) {
      config.update(workspaceConfig);
    }
  });

  // -----------------------------------------------------------------
  // Get version of the extension
  // -----------------------------------------------------------------

  // Get the previous version of the extension
  const previousVersion = context.globalState.get('version');
  // Get the current version of the extension
  const currentVersion = context.extension.packageJSON.version;

  if (!previousVersion) {
    // Check if the extension is running for the first time
    const message = vscode.l10n.t(
      'Welcome to {0} version {1}! The extension is now active',
      [EXTENSION_DISPLAY_NAME, currentVersion],
    );
    vscode.window.showInformationMessage(message);

    // Update the version in the global state
    context.globalState.update('version', currentVersion);
  }

  if (previousVersion && previousVersion !== currentVersion) {
    // Check if the extension has been updated
    const actions: vscode.MessageItem[] = [
      {
        title: vscode.l10n.t('Release Notes'),
      },
      {
        title: vscode.l10n.t('Dismiss'),
      },
    ];

    const message = vscode.l10n.t(
      'New version of {0} is available. Check out the release notes for version {1}',
      [EXTENSION_DISPLAY_NAME, currentVersion],
    );
    vscode.window.showInformationMessage(message, ...actions).then((option) => {
      if (!option) {
        return;
      }

      // Handle the actions
      switch (option?.title) {
        case actions[0].title:
          vscode.env.openExternal(
            vscode.Uri.parse(
              `https://marketplace.visualstudio.com/items/${USER_PUBLISHER}.${EXTENSION_NAME}/changelog`,
            ),
          );
          break;

        default:
          break;
      }
    });

    // Update the version in the global state
    context.globalState.update('version', currentVersion);
  }

  // -----------------------------------------------------------------
  // Register CommentController
  // -----------------------------------------------------------------

  // Create a new CommentService
  const commentService = new CommentService(config);

  // Create a new CommentController
  const commentController = new CommentController(commentService);

  const disposableInsertComment = vscode.commands.registerCommand(
    `${EXTENSION_ID}.insertComment`,
    () => {
      if (!config.enable) {
        const message = vscode.l10n.t(
          '{0} is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        );
        vscode.window.showWarningMessage(message);
        return;
      }

      commentController.insertTextInActiveEditor();
    },
  );
  const disposableRemoveSingleLineComments = vscode.commands.registerCommand(
    `${EXTENSION_ID}.removeSingleLineComments`,
    () => {
      if (!config.enable) {
        const message = vscode.l10n.t(
          '{0} is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        );
        vscode.window.showWarningMessage(message);
        return;
      }

      commentController.removeSingleLineComments();
    },
  );

  context.subscriptions.push(
    disposableInsertComment,
    disposableRemoveSingleLineComments,
  );

  // -----------------------------------------------------------------
  // Register HighlightController
  // -----------------------------------------------------------------

  // Create a new HighlightController
  const highlightController = new HighlightController(config);

  // Function to update highlighting in the active editor.
  const updateHighlighting = () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      if (!config.enable) {
        const message = vscode.l10n.t(
          '{0} is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        );
        vscode.window.showWarningMessage(message);
        return;
      }

      if (config.highlightActive) {
        highlightController.updateHighlighting(editor);
      } else {
        highlightController.clearHighlighting(editor);
      }
    }
  };

  // Debounced update using an inline closure.
  const debouncedUpdate = (() => {
    let timeout: NodeJS.Timeout | undefined;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => updateHighlighting(), 200);
    };
  })();

  // Subscribe to changes in the active editor.
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateHighlighting),
  );

  // Subscribe to document changes with a slight delay to ensure the edit has been applied.
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        debouncedUpdate();
      }
    }),
  );

  // Initial highlighting update.
  updateHighlighting();
}

// this method is called when your extension is deactivated
export function deactivate() {}
