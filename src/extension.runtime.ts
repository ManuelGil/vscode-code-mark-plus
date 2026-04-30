import {
  commands,
  ExtensionContext,
  env,
  l10n,
  MessageItem,
  Uri,
  WorkspaceFolder,
  window,
  workspace,
} from 'vscode';
import { VSCodeMarketplaceClient } from 'vscode-marketplace-client';

import {
  CommandIds,
  ContextKeys,
  EXTENSION_DISPLAY_NAME,
  EXTENSION_ID,
  EXTENSION_NAME,
  ExtensionConfig,
  REPOSITORY_URL,
  USER_PUBLISHER,
  ViewIds,
} from './app/configs';
import {
  CommentController,
  HighlightController,
  TagBrowserController,
  TodoController,
} from './app/controllers';
import { debounce, showNoWorkspaceFolderError } from './app/helpers';
import { TagBrowserProvider } from './app/providers';
import { CommentService, TagIndexService, TodoService } from './app/services';

export class ExtensionRuntime {
  /**
   * Avoids repeated disabled-state notifications across command invocations.
   */
  private hasDisabledWarningBeenShown = false;

  /**
   * Current workspace-scoped extension configuration.
   */
  private config!: ExtensionConfig;

  private commentService: CommentService | undefined;
  private commentController: CommentController | undefined;
  private todoService: TodoService | undefined;
  private todoController: TodoController | undefined;
  private tagBrowserController: TagBrowserController | undefined;
  private tagBrowserProvider: TagBrowserProvider | undefined;
  private tagIndexService: TagIndexService | undefined;
  private highlightController: HighlightController | undefined;

  constructor(public readonly context: ExtensionContext) {}

  async initialize(): Promise<boolean> {
    const workspaceFolder = await this.selectWorkspaceFolder();

    if (!workspaceFolder) {
      return false;
    }

    this.initializeConfiguration(workspaceFolder);

    if (!this.isExtensionEnabled()) {
      return false;
    }

    this.startVersionChecks();

    return true;
  }

  async start(): Promise<void> {
    this.registerWorkspaceCommands();
    this.registerCommentCommands();
    this.registerTagBrowserCommands();
    this.registerNoteCommands();

    this.highlightController = new HighlightController(this.config);

    const updateHighlighting = () => {
      const editor = window.activeTextEditor;

      if (editor) {
        if (!this.isExtensionEnabled()) {
          return;
        }

        if (this.config.highlightActive) {
          this.highlightController?.updateHighlighting(editor);
        } else {
          this.highlightController?.clearHighlighting(editor);
        }
      }
    };

    const debouncedUpdate = debounce(updateHighlighting, 200);

    this.context.subscriptions.push(
      window.onDidChangeActiveTextEditor(updateHighlighting),
    );

    this.context.subscriptions.push(
      workspace.onDidChangeTextDocument((event) => {
        if (
          window.activeTextEditor &&
          event.document === window.activeTextEditor.document
        ) {
          debouncedUpdate();
        }
      }),
    );

    updateHighlighting();
  }

  /**
   * Runs non-blocking version checks after startup.
   */
  private startVersionChecks(): void {
    void this.handleLocalVersionNotifications();
    void this.checkMarketplaceVersion();
  }

  /**
   * Returns the extension version declared in package metadata.
   */
  private getCurrentVersion(): string {
    return this.context.extension.packageJSON?.version ?? '0.0.0';
  }

  /**
   * Handles first-run and local update notifications.
   */
  private async handleLocalVersionNotifications(): Promise<void> {
    const previousVersion = this.context.globalState.get<string>(
      ContextKeys.Version,
    );

    const currentVersion = this.getCurrentVersion();

    if (!previousVersion) {
      const welcomeMessage = l10n.t(
        'Welcome to {0} version {1}! The extension is now active',
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      window.showInformationMessage(welcomeMessage);

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );

      return;
    }

    if (previousVersion !== currentVersion) {
      const actionReleaseNotes: MessageItem = {
        title: l10n.t('Release Notes'),
      };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionReleaseNotes, actionDismiss];

      const updateMessage = l10n.t(
        "The {0} extension has been updated. Check out what's new in version {1}",
        EXTENSION_DISPLAY_NAME,
        currentVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      if (userSelection?.title === actionReleaseNotes.title) {
        const changelogUrl = `${REPOSITORY_URL}/blob/main/CHANGELOG.md`;
        env.openExternal(Uri.parse(changelogUrl));
      }

      await this.context.globalState.update(
        ContextKeys.Version,
        currentVersion,
      );
    }
  }

  /**
   * Checks Marketplace for a newer published extension version.
   */
  private async checkMarketplaceVersion(): Promise<void> {
    const currentVersion = this.getCurrentVersion();

    try {
      const latestVersion = await VSCodeMarketplaceClient.getLatestVersion(
        USER_PUBLISHER,
        EXTENSION_NAME,
      );

      if (latestVersion === currentVersion) {
        return;
      }

      const actionUpdateNow: MessageItem = { title: l10n.t('Update Now') };
      const actionDismiss: MessageItem = { title: l10n.t('Dismiss') };
      const availableActions = [actionUpdateNow, actionDismiss];

      const updateMessage = l10n.t(
        'A new version of {0} is available. Update to version {1} now',
        EXTENSION_DISPLAY_NAME,
        latestVersion,
      );

      const userSelection = await window.showInformationMessage(
        updateMessage,
        ...availableActions,
      );

      if (userSelection?.title === actionUpdateNow.title) {
        await commands.executeCommand(
          'workbench.extensions.action.install.anotherVersion',
          `${USER_PUBLISHER}.${EXTENSION_NAME}`,
        );
      }
    } catch (error) {
      console.error('Error retrieving extension version:', error);
    }
  }

  /**
   * Selects the workspace folder that scopes configuration and generation.
   */
  private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
    const availableWorkspaceFolders = workspace.workspaceFolders;

    if (!availableWorkspaceFolders || availableWorkspaceFolders.length === 0) {
      showNoWorkspaceFolderError(EXTENSION_DISPLAY_NAME);

      return undefined;
    }

    const previousFolderUriString = this.context.globalState.get<string>(
      ContextKeys.SelectedWorkspaceFolder,
    );
    let previousFolder: WorkspaceFolder | undefined;

    if (previousFolderUriString) {
      previousFolder = availableWorkspaceFolders.find(
        (folder) => folder.uri.toString() === previousFolderUriString,
      );
    }

    if (availableWorkspaceFolders.length === 1) {
      return availableWorkspaceFolders[0];
    }

    if (previousFolder) {
      window.showInformationMessage(
        l10n.t('Using workspace folder: {0}', previousFolder.name),
      );

      return previousFolder;
    }

    const pickerPlaceholder = l10n.t(
      '{0}: Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
      EXTENSION_DISPLAY_NAME,
    );
    const selectedFolder = await window.showWorkspaceFolderPick({
      placeHolder: pickerPlaceholder,
    });

    if (selectedFolder) {
      this.context.globalState.update(
        ContextKeys.SelectedWorkspaceFolder,
        selectedFolder.uri.toString(),
      );
    }

    return selectedFolder;
  }

  /**
   * Initializes workspace configuration and registers configuration listeners.
   *
   * @param selectedWorkspaceFolder - The workspace folder used to load the configuration.
   */
  private initializeConfiguration(
    selectedWorkspaceFolder: WorkspaceFolder,
  ): void {
    this.config = new ExtensionConfig(
      workspace.getConfiguration(EXTENSION_ID, selectedWorkspaceFolder.uri),
    );

    this.config.workspaceSelection = selectedWorkspaceFolder.uri.fsPath;

    workspace.onDidChangeConfiguration((configurationChangeEvent) => {
      const updatedWorkspaceConfig = workspace.getConfiguration(
        EXTENSION_ID,
        selectedWorkspaceFolder.uri,
      );

      if (
        configurationChangeEvent.affectsConfiguration(
          `${EXTENSION_ID}.enable`,
          selectedWorkspaceFolder.uri,
        )
      ) {
        const isExtensionEnabled =
          updatedWorkspaceConfig.get<boolean>('enable');

        this.config.update(updatedWorkspaceConfig);

        if (isExtensionEnabled) {
          const enabledMessage = l10n.t(
            'The {0} extension is now enabled and ready to use',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(enabledMessage);
        } else {
          const disabledMessage = l10n.t(
            'The {0} extension is now disabled',
            EXTENSION_DISPLAY_NAME,
          );
          window.showInformationMessage(disabledMessage);
        }
      }

      if (
        configurationChangeEvent.affectsConfiguration(
          EXTENSION_ID,
          selectedWorkspaceFolder.uri,
        )
      ) {
        this.config.update(updatedWorkspaceConfig);
      }
    });
  }

  /**
   * Returns whether commands should execute under current configuration.
   *
   * @remarks
   * Shows a disabled warning once until the extension is re-enabled.
   */
  private isExtensionEnabled(): boolean {
    const isEnabled = this.config.enable;

    if (isEnabled) {
      this.hasDisabledWarningBeenShown = false;
      return true;
    }

    if (!this.hasDisabledWarningBeenShown) {
      window.showErrorMessage(
        l10n.t(
          'The {0} extension is disabled in settings. Enable it to use its features',
          EXTENSION_DISPLAY_NAME,
        ),
      );
      this.hasDisabledWarningBeenShown = true;
    }

    return false;
  }

  /**
   * Registers workspace selection command for multi-root workspaces.
   */
  private registerWorkspaceCommands(): void {
    const disposableChangeWorkspace = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.ChangeWorkspace}`,
      async () => {
        const pickerPlaceholder = l10n.t('Select a workspace folder to use');
        const selectedFolder = await window.showWorkspaceFolderPick({
          placeHolder: pickerPlaceholder,
        });

        if (selectedFolder) {
          this.context.globalState.update(
            ContextKeys.SelectedWorkspaceFolder,
            selectedFolder.uri.toString(),
          );

          const updatedWorkspaceConfig = workspace.getConfiguration(
            EXTENSION_ID,
            selectedFolder.uri,
          );
          this.config.update(updatedWorkspaceConfig);

          this.config.workspaceSelection = selectedFolder.uri.fsPath;

          window.showInformationMessage(
            l10n.t('Switched to workspace folder: {0}', selectedFolder.name),
          );
        }
      },
    );

    this.context.subscriptions.push(disposableChangeWorkspace);
  }

  private registerCommentCommands(): void {
    this.commentService = new CommentService(this.config);
    this.commentController = new CommentController(this.commentService);

    const extensionCommands = [
      {
        id: CommandIds.InsertComment,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController?.insertTextInActiveEditor();
        },
      },
      {
        id: CommandIds.RemoveSingleLineComments,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController?.removeSingleLineComments();
        },
      },
      {
        id: CommandIds.RemoveAllSingleLineComments,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController?.removeAllSingleLineComments();
        },
      },
    ];

    extensionCommands.forEach(({ id, handler }) => {
      const disposable = commands.registerCommand(
        `${EXTENSION_ID}.${id}`,
        handler,
      );

      this.context.subscriptions.push(disposable);
    });
  }

  private registerTagBrowserCommands(): void {
    this.tagBrowserController = new TagBrowserController(this.config);
    this.tagIndexService = new TagIndexService(this.tagBrowserController);
    this.tagBrowserController.setTagIndexService(this.tagIndexService);

    this.tagBrowserProvider = new TagBrowserProvider(this.tagIndexService);
    this.context.subscriptions.push(this.tagBrowserProvider);

    this.context.subscriptions.push(
      window.createTreeView(ViewIds.TagBrowserView, {
        treeDataProvider: this.tagBrowserProvider,
        showCollapseAll: true,
      }),
    );

    const disposableRefreshList = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.RefreshTagBrowserList}`,
      async () => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        this.tagBrowserProvider?.refresh();
        this.tagIndexService?.clear();
        await this.tagIndexService?.scanWorkspace();
      },
    );

    const disposableOpenTagBrowserFile = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.OpenTagBrowserFile}`,
      async (fileUri, lineNumber?: number) => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        await this.tagBrowserController?.openFile(fileUri, lineNumber);
      },
    );

    this.context.subscriptions.push(
      disposableRefreshList,
      disposableOpenTagBrowserFile,
      this.tagIndexService,
    );
  }

  private registerNoteCommands(): void {
    this.todoService = new TodoService(this.config);
    this.todoController = new TodoController(this.todoService);

    const noteCommands = [
      {
        id: CommandIds.AppendToTodoFile,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          return this.todoController?.appendToTodoFile();
        },
      },
      {
        id: CommandIds.OpenTodoFile,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          return this.todoController?.openTodoFile();
        },
      },
    ];

    noteCommands.forEach(({ id, handler }) => {
      const disposable = commands.registerCommand(
        `${EXTENSION_ID}.${id}`,
        handler,
      );

      this.context.subscriptions.push(disposable);
    });
  }
}
