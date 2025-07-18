// The module 'vscode' contains the VSCode extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCodeMarketplaceClient } from 'vscode-marketplace-client';

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

  // Try to load previously selected workspace folder from global state
  const previousFolderUri = context.globalState.get<string>(
    'selectedWorkspaceFolder',
  );
  let previousFolder: vscode.WorkspaceFolder | undefined;

  if (previousFolderUri) {
    // Find the workspace folder by URI
    previousFolder = vscode.workspace.workspaceFolders.find(
      (folder) => folder.uri.toString() === previousFolderUri,
    );
  }

  if (vscode.workspace.workspaceFolders.length === 1) {
    // Determine the workspace folder to use
    // Only one workspace folder available
    resource = vscode.workspace.workspaceFolders[0];
  } else if (previousFolder) {
    // Use previously selected workspace folder if available
    resource = previousFolder;

    // Notify the user which workspace is being used
    vscode.window.showInformationMessage(
      vscode.l10n.t('Using workspace folder: {0}', [resource.name]),
    );
  } else {
    // Multiple workspace folders and no previous selection
    const placeHolder = vscode.l10n.t(
      'Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
    );
    const selectedFolder = await vscode.window.showWorkspaceFolderPick({
      placeHolder,
    });

    resource = selectedFolder;

    // Remember the selection for future use
    if (resource) {
      context.globalState.update(
        'selectedWorkspaceFolder',
        resource.uri.toString(),
      );
    }
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

    if (event.affectsConfiguration(`${EXTENSION_ID}.enable`, resource?.uri)) {
      const isEnabled = workspaceConfig.get<boolean>('enable');

      config.update(workspaceConfig);

      if (isEnabled) {
        const message = vscode.l10n.t(
          'The {0} extension is now enabled and ready to use',
          [EXTENSION_DISPLAY_NAME],
        );
        vscode.window.showInformationMessage(message);
      } else {
        const message = vscode.l10n.t('The {0} extension is now disabled', [
          EXTENSION_DISPLAY_NAME,
        ]);
        vscode.window.showInformationMessage(message);
      }
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
      "The {0} extension has been updated. Check out what's new in version {1}",
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
  // Check for updates
  // -----------------------------------------------------------------

  // Check for updates to the extension
  try {
    // Retrieve the latest version
    VSCodeMarketplaceClient.getLatestVersion(USER_PUBLISHER, EXTENSION_NAME)
      .then((latestVersion) => {
        // Check if the latest version is different from the current version
        if (latestVersion !== currentVersion) {
          const actions: vscode.MessageItem[] = [
            {
              title: vscode.l10n.t('Update Now'),
            },
            {
              title: vscode.l10n.t('Dismiss'),
            },
          ];

          const message = vscode.l10n.t(
            'A new version of {0} is available. Update to version {1} now',
            [EXTENSION_DISPLAY_NAME, latestVersion],
          );
          vscode.window
            .showInformationMessage(message, ...actions)
            .then(async (option) => {
              if (!option) {
                return;
              }

              // Handle the actions
              switch (option?.title) {
                case actions[0].title:
                  await vscode.commands.executeCommand(
                    'workbench.extensions.action.install.anotherVersion',
                    `${USER_PUBLISHER}.${EXTENSION_NAME}`,
                  );
                  break;

                default:
                  break;
              }
            });
        }
      })
      .catch((error) => {
        // Silently log the error without bothering the user
        // This prevents issues when offline or when marketplace is unreachable
        console.error('Error checking for updates:', error);
      });
  } catch (error) {
    // Only log fatal errors that occur during the update check process
    console.error('Fatal error while checking for extension updates:', error);
  }

  // -----------------------------------------------------------------
  // Register commands
  // -----------------------------------------------------------------

  // Register a command to change the selected workspace folder
  const disposableChangeWorkspace = vscode.commands.registerCommand(
    `${EXTENSION_ID}.changeWorkspace`,
    async () => {
      const placeHolder = vscode.l10n.t('Select a workspace folder to use');
      const selectedFolder = await vscode.window.showWorkspaceFolderPick({
        placeHolder,
      });

      if (selectedFolder) {
        resource = selectedFolder;
        context.globalState.update(
          'selectedWorkspaceFolder',
          resource.uri.toString(),
        );

        // Update configuration for the new workspace folder
        const workspaceConfig = vscode.workspace.getConfiguration(
          EXTENSION_ID,
          resource?.uri,
        );
        config.update(workspaceConfig);

        vscode.window.showInformationMessage(
          vscode.l10n.t('Switched to workspace folder: {0}', [resource.name]),
        );
      }
    },
  );

  context.subscriptions.push(disposableChangeWorkspace);

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
          'The {0} extension is disabled in settings. Enable it to use its features',
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
          'The {0} extension is disabled in settings. Enable it to use its features',
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
          'The {0} extension is disabled in settings. Enable it to use its features',
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

  /**
   * Debounce function to prevent excessive updates
   * @param func Function to debounce
   * @param wait Wait time in milliseconds
   */
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | undefined;
    return function (...args: Parameters<T>) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Create a debounced version of the update function
  const debouncedUpdate = debounce(updateHighlighting, 200);

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
