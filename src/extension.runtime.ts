import {
  commands,
  Disposable,
  EventEmitter,
  ExtensionContext,
  env,
  l10n,
  languages,
  MessageItem,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
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
  AddressNavigationController,
  CommentController,
  ContextWorkspaceController,
  HighlightController,
  TagBrowserController,
} from './app/controllers';
import {
  AddressDiscoveryWorkflow,
  debounce,
  showNoWorkspaceFolderError,
} from './app/helpers';
import { getNormalizedHighlightRules } from './app/helpers/highlight-rules.helper';
import { NodeModel } from './app/models';
import { AddressLinkProvider, TagBrowserProvider } from './app/providers';
import {
  CommentService,
  ContextWorkspaceService,
  TagIndexService,
} from './app/services';

/**
 * Main extension runtime orchestration layer.
 *
 * RESPONSIBILITIES:
 * - Workspace initialization
 * - Runtime composition
 * - Capability registration
 * - Extension lifecycle coordination
 * - VSCode integration wiring
 *
 * DOES NOT:
 * - Implement domain logic
 * - Parse operational references
 * - Navigate files directly
 * - Resolve contextual addresses
 * - Execute editor workflows
 *
 * Domain behavior belongs to:
 * - controllers
 * - services
 * - providers
 * - helpers
 *
 * The runtime intentionally remains:
 * - lightweight
 * - deterministic
 * - orchestration-oriented
 * - lifecycle-coherent
 *
 * @export
 * @class ExtensionRuntime
 */
export class ExtensionRuntime {
  /**
   * Prevents repeated disabled-state notifications.
   *
   * @private
   * @type {boolean}
   * @memberof ExtensionRuntime
   */
  private hasDisabledWarningBeenShown = false;

  /**
   * Workspace-scoped extension configuration.
   *
   * @private
   * @type {ExtensionConfig}
   * @memberof ExtensionRuntime
   */
  private config!: ExtensionConfig;

  // --------------------------------------------------------------------------
  // Services
  // --------------------------------------------------------------------------

  /**
   * Comment domain service.
   *
   * @private
   * @type {CommentService}
   * @memberof ExtensionRuntime
   */
  private commentService!: CommentService;

  /**
   * Todo domain service.
   *
   * @private
   * @type {ContextWorkspaceService}
   * @memberof ExtensionRuntime
   */
  private contextWorkspaceService!: ContextWorkspaceService;

  /**
   * Workspace tag indexing service.
   *
   * @private
   * @type {TagIndexService}
   * @memberof ExtensionRuntime
   */
  private tagIndexService!: TagIndexService;

  // --------------------------------------------------------------------------
  // Controllers
  // --------------------------------------------------------------------------

  /**
   * Comment operational controller.
   *
   * @private
   * @type {CommentController}
   * @memberof ExtensionRuntime
   */
  private commentController!: CommentController;

  /**
   * Todo operational controller.
   *
   * @private
   * @type {ContextWorkspaceController}
   * @memberof ExtensionRuntime
   */
  private contextWorkspaceController!: ContextWorkspaceController;

  /**
   * Workspace tag browser controller.
   *
   * @private
   * @type {TagBrowserController}
   * @memberof ExtensionRuntime
   */
  private tagBrowserController!: TagBrowserController;

  /**
   * Lightweight operational address navigation controller.
   *
   * @private
   * @type {AddressNavigationController}
   * @memberof ExtensionRuntime
   */
  private addressNavigationController!: AddressNavigationController;

  /**
   * Lightweight operational address discovery workflow.
   *
   * @private
   * @type {AddressDiscoveryWorkflow}
   * @memberof ExtensionRuntime
   */
  private addressDiscoveryWorkflow!: AddressDiscoveryWorkflow;

  /**
   * Active editor highlighting controller.
   *
   * @private
   * @type {HighlightController}
   * @memberof ExtensionRuntime
   */
  private highlightController!: HighlightController;

  // --------------------------------------------------------------------------
  // Providers
  // --------------------------------------------------------------------------

  /**
   * Workspace tag browser provider.
   *
   * @private
   * @type {TagBrowserProvider}
   * @memberof ExtensionRuntime
   */
  private tagBrowserProvider!: TagBrowserProvider;

  /**
   * Active highlight-related listeners.
   *
   * @private
   * @type {Disposable[]}
   * @memberof ExtensionRuntime
   */
  private highlightListeners: Disposable[] = [];

  /**
   * Creates a new ExtensionRuntime instance.
   *
   * @constructor
   * @param {ExtensionContext} context - VSCode extension context
   */
  constructor(readonly context: ExtensionContext) {}

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  /**
   * Initializes workspace-scoped runtime state.
   *
   * RESPONSIBILITIES:
   * - Workspace selection
   * - Configuration initialization
   * - Runtime readiness validation
   * - Version checks bootstrap
   *
   * @async
   * @function initialize
   * @memberof ExtensionRuntime
   *
   * @returns {Promise<boolean>}
   */
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

  /**
   * Starts runtime capabilities.
   *
   * Runtime startup intentionally follows:
   *
   * 1. Runtime composition
   * 2. Capability registration
   * 3. Reactive synchronization
   *
   * @async
   * @function start
   * @memberof ExtensionRuntime
   *
   * @returns {Promise<void>}
   */
  async start(): Promise<void> {
    this.initializeRuntime();

    this.registerWorkspaceCommands();
    this.registerCommentCommands();
    this.registerTagBrowserCommands();
    this.registerNoteCommands();
    this.registerAddressNavigation();

    this.syncHighlightingState();
  }

  /**
   * Initializes runtime services,
   * controllers, and providers.
   *
   * This phase establishes deterministic
   * runtime composition before capability
   * registration occurs.
   *
   * @private
   * @function initializeRuntime
   * @memberof ExtensionRuntime
   */
  private initializeRuntime(): void {
    // Ensure services are initialized before controllers (controllers depend on services)
    this.initializeServices();

    this.initializeControllers();

    this.initializeProviders();
  }

  /**
   * Initializes runtime services.
   *
   * Services contain domain-oriented
   * operational primitives.
   *
   * @private
   * @function initializeServices
   * @memberof ExtensionRuntime
   */
  private initializeServices(): void {
    this.commentService = new CommentService(this.config);

    this.contextWorkspaceService = new ContextWorkspaceService(this.config);

    // NOTE: TagIndexService depends on TagBrowserController which is created
    // during controller initialization. It will be instantiated after controllers
    // are initialized to avoid undefined dependencies.
  }

  /**
   * Initializes runtime controllers.
   *
   * Controllers orchestrate operational
   * editor workflows and user interactions.
   *
   * @private
   * @function initializeControllers
   * @memberof ExtensionRuntime
   */
  private initializeControllers(): void {
    this.tagBrowserController = new TagBrowserController(this.config);

    // Instantiate TagIndexService now that tagBrowserController exists
    this.tagIndexService = new TagIndexService(this.tagBrowserController);

    this.commentController = new CommentController(this.commentService);

    this.contextWorkspaceController = new ContextWorkspaceController(
      this.contextWorkspaceService,
    );

    // Initialize lightweight discovery workflow
    this.addressDiscoveryWorkflow = new AddressDiscoveryWorkflow(
      this.commentService,
    );

    this.addressNavigationController = new AddressNavigationController(
      this.config,
      this.tagBrowserController,
      this.addressDiscoveryWorkflow,
    );
  }

  /**
   * Initializes runtime providers.
   *
   * Providers expose lightweight
   * editor-native affordances.
   *
   * @private
   * @function initializeProviders
   * @memberof ExtensionRuntime
   */
  private initializeProviders(): void {
    this.tagBrowserProvider = new TagBrowserProvider(this.tagIndexService);
  }

  // --------------------------------------------------------------------------
  // Version checks
  // --------------------------------------------------------------------------

  /**
   * Starts non-blocking extension
   * version checks after runtime startup.
   *
   * @private
   * @function startVersionChecks
   * @memberof ExtensionRuntime
   */
  private startVersionChecks(): void {
    void this.handleLocalVersionNotifications();

    void this.checkMarketplaceVersion();
  }

  /**
   * Returns the current extension version.
   *
   * @private
   * @function getCurrentVersion
   * @memberof ExtensionRuntime
   *
   * @returns {string}
   */
  private getCurrentVersion(): string {
    return this.context.extension.packageJSON?.version ?? '0.0.0';
  }

  /**
   * Handles first-run and local
   * update notifications.
   *
   * @async
   * @function handleLocalVersionNotifications
   * @private
   * @memberof ExtensionRuntime
   *
   * @returns {Promise<void>}
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
      const releaseNotesAction: MessageItem = {
        title: l10n.t('Release Notes'),
      };

      const dismissAction: MessageItem = {
        title: l10n.t('Dismiss'),
      };

      const selectedAction = await window.showInformationMessage(
        l10n.t(
          "The {0} extension has been updated. Check out what's new in version {1}",
          EXTENSION_DISPLAY_NAME,
          currentVersion,
        ),
        releaseNotesAction,
        dismissAction,
      );

      if (selectedAction?.title === releaseNotesAction.title) {
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
   * Checks VSCode Marketplace for
   * newer extension versions.
   *
   * @async
   * @function checkMarketplaceVersion
   * @private
   * @memberof ExtensionRuntime
   *
   * @returns {Promise<void>}
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

      const updateAction: MessageItem = {
        title: l10n.t('Update Now'),
      };

      const dismissAction: MessageItem = {
        title: l10n.t('Dismiss'),
      };

      const selectedAction = await window.showInformationMessage(
        l10n.t(
          'A new version of {0} is available. Update to version {1} now',
          EXTENSION_DISPLAY_NAME,
          latestVersion,
        ),
        updateAction,
        dismissAction,
      );

      if (selectedAction?.title === updateAction.title) {
        await commands.executeCommand(
          'workbench.extensions.action.install.anotherVersion',
          `${USER_PUBLISHER}.${EXTENSION_NAME}`,
        );
      }
    } catch (error) {
      console.error('Error retrieving extension version:', error);
    }
  }

  // --------------------------------------------------------------------------
  // Workspace selection
  // --------------------------------------------------------------------------

  /**
   * Selects the workspace folder used
   * to scope extension configuration.
   *
   * Multi-root workspaces preserve
   * the previously selected folder.
   *
   * @async
   * @function selectWorkspaceFolder
   * @private
   * @memberof ExtensionRuntime
   *
   * @returns {Promise<WorkspaceFolder | undefined>}
   */
  private async selectWorkspaceFolder(): Promise<WorkspaceFolder | undefined> {
    const availableWorkspaceFolders = workspace.workspaceFolders;

    if (!availableWorkspaceFolders || availableWorkspaceFolders.length === 0) {
      showNoWorkspaceFolderError(EXTENSION_DISPLAY_NAME);

      return undefined;
    }

    const previousFolderUri = this.context.globalState.get<string>(
      ContextKeys.SelectedWorkspaceFolder,
    );

    const previousFolder = availableWorkspaceFolders.find(
      (folder) => folder.uri.toString() === previousFolderUri,
    );

    if (availableWorkspaceFolders.length === 1) {
      return availableWorkspaceFolders[0];
    }

    if (previousFolder) {
      window.showInformationMessage(
        l10n.t('Using workspace folder: {0}', previousFolder.name),
      );

      return previousFolder;
    }

    const selectedFolder = await window.showWorkspaceFolderPick({
      placeHolder: l10n.t(
        '{0}: Select a workspace folder to use. This folder will be used to load workspace-specific configuration for the extension',
        EXTENSION_DISPLAY_NAME,
      ),
    });

    if (selectedFolder) {
      await this.context.globalState.update(
        ContextKeys.SelectedWorkspaceFolder,
        selectedFolder.uri.toString(),
      );
    }

    return selectedFolder;
  }

  // --------------------------------------------------------------------------
  // Configuration
  // --------------------------------------------------------------------------

  /**
   * Initializes workspace-scoped
   * extension configuration.
   *
   * Also registers configuration
   * synchronization listeners.
   *
   * @private
   * @function initializeConfiguration
   * @memberof ExtensionRuntime
   *
   * @param {WorkspaceFolder} workspaceFolder
   */
  private initializeConfiguration(workspaceFolder: WorkspaceFolder): void {
    this.config = new ExtensionConfig(
      workspace.getConfiguration(EXTENSION_ID, workspaceFolder.uri),
    );

    this.config.workspaceSelection = workspaceFolder.uri.fsPath;

    workspace.onDidChangeConfiguration((event) => {
      const updatedConfiguration = workspace.getConfiguration(
        EXTENSION_ID,
        workspaceFolder.uri,
      );

      if (
        event.affectsConfiguration(
          `${EXTENSION_ID}.enable`,
          workspaceFolder.uri,
        )
      ) {
        const isEnabled = updatedConfiguration.get<boolean>('enable');

        this.config.update(updatedConfiguration);

        const message = isEnabled
          ? l10n.t(
              'The {0} extension is now enabled and ready to use',
              EXTENSION_DISPLAY_NAME,
            )
          : l10n.t('The {0} extension is now disabled', EXTENSION_DISPLAY_NAME);

        window.showInformationMessage(message);
      }

      if (event.affectsConfiguration(EXTENSION_ID, workspaceFolder.uri)) {
        this.config.update(updatedConfiguration);

        this.syncHighlightingState();
      }
    });
  }

  /**
   * Returns whether extension
   * capabilities should execute.
   *
   * Disabled-state notifications are
   * intentionally shown once until
   * the extension is re-enabled.
   *
   * @private
   * @function isExtensionEnabled
   * @memberof ExtensionRuntime
   *
   * @returns {boolean}
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

  // --------------------------------------------------------------------------
  // Workspace commands
  // --------------------------------------------------------------------------

  /**
   * Registers workspace-scoped commands.
   *
   * RESPONSIBILITIES:
   * - Workspace switching
   * - Workspace persistence
   * - Workspace configuration synchronization
   *
   * @private
   * @function registerWorkspaceCommands
   * @memberof ExtensionRuntime
   */
  private registerWorkspaceCommands(): void {
    const disposable = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.ChangeWorkspace}`,
      async () => {
        const selectedFolder = await window.showWorkspaceFolderPick({
          placeHolder: l10n.t('Select a workspace folder to use'),
        });

        if (!selectedFolder) {
          return;
        }

        await this.context.globalState.update(
          ContextKeys.SelectedWorkspaceFolder,
          selectedFolder.uri.toString(),
        );

        const updatedConfiguration = workspace.getConfiguration(
          EXTENSION_ID,
          selectedFolder.uri,
        );

        this.config.update(updatedConfiguration);

        this.config.workspaceSelection = selectedFolder.uri.fsPath;

        window.showInformationMessage(
          l10n.t('Switched to workspace folder: {0}', selectedFolder.name),
        );
      },
    );

    this.context.subscriptions.push(disposable);
  }

  // --------------------------------------------------------------------------
  // Comment commands
  // --------------------------------------------------------------------------

  /**
   * Registers comment-related commands.
   *
   * RESPONSIBILITIES:
   * - Annotation insertion
   * - Annotation replacement
   * - Annotation cleanup
   *
   * Operational behavior belongs to:
   * - CommentController
   *
   * @private
   * @function registerCommentCommands
   * @memberof ExtensionRuntime
   */
  private registerCommentCommands(): void {
    const commandsToRegister = [
      {
        id: CommandIds.InsertComment,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController.insertTextInActiveEditor();
        },
      },

      {
        id: CommandIds.ReplaceAnnotationTagInSelection,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController.replaceAnnotationTagInSelection();
        },
      },

      {
        id: CommandIds.ReplaceAnnotationTagInFile,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController.replaceAnnotationTagInActiveFile();
        },
      },

      {
        id: CommandIds.RemoveSingleLineComments,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController.removeSingleLineComments();
        },
      },

      {
        id: CommandIds.RemoveAllSingleLineComments,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          this.commentController.removeAllSingleLineComments();
        },
      },
    ];

    for (const commandDefinition of commandsToRegister) {
      const disposable = commands.registerCommand(
        `${EXTENSION_ID}.${commandDefinition.id}`,
        () => {
          return commandDefinition.handler();
        },
      );

      this.context.subscriptions.push(disposable);
    }
  }

  // --------------------------------------------------------------------------
  // Tag browser commands
  // --------------------------------------------------------------------------

  /**
   * Registers tag browser capabilities.
   *
   * RESPONSIBILITIES:
   * - Tree view registration
   * - Refresh orchestration
   * - File opening delegation
   *
   * Operational behavior belongs to:
   * - TagBrowserController
   * - TagBrowserProvider
   * - TagIndexService
   *
   * @private
   * @function registerTagBrowserCommands
   * @memberof ExtensionRuntime
   */
  private registerTagBrowserCommands(): void {
    const lazyProvider = this.createLazyTagBrowserProvider();

    this.context.subscriptions.push(lazyProvider);

    const treeView = window.createTreeView(ViewIds.TagBrowserView, {
      treeDataProvider: lazyProvider,
      showCollapseAll: true,
    });

    this.context.subscriptions.push(treeView);

    const refreshDisposable = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.RefreshTagBrowserList}`,
      async () => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        this.tagBrowserProvider.refresh();

        await this.tagIndexService.refreshWorkspace();
      },
    );

    const legacyRefreshDisposable = commands.registerCommand(
      `${EXTENSION_ID}.tagBrowserView.refreshList`,
      async () => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        this.tagBrowserProvider.refresh();

        await this.tagIndexService.refreshWorkspace();
      },
    );

    const openFileDisposable = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.OpenTagBrowserFile}`,
      async (fileUri: Uri, lineNumber?: number) => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        await this.tagBrowserController.openFile(fileUri, lineNumber);
      },
    );

    this.context.subscriptions.push(
      refreshDisposable,
      legacyRefreshDisposable,
      openFileDisposable,
    );
  }

  // --------------------------------------------------------------------------
  // Context note commands
  // --------------------------------------------------------------------------

  /**
   * Registers context-note commands.
   *
   * RESPONSIBILITIES:
   * - Todo file append
   *
   * Operational behavior belongs to:
   * - ContextWorkspaceController
   *
   * @private
   * @function registerNoteCommands
   * @memberof ExtensionRuntime
   */
  private registerNoteCommands(): void {
    const commandsToRegister = [
      {
        id: CommandIds.AppendToTodoFile,
        handler: () => {
          if (!this.isExtensionEnabled()) {
            return;
          }

          return this.contextWorkspaceController.promoteSelectionToContextNote();
        },
      },
    ];

    for (const commandDefinition of commandsToRegister) {
      const disposable = commands.registerCommand(
        `${EXTENSION_ID}.${commandDefinition.id}`,
        commandDefinition.handler,
      );

      this.context.subscriptions.push(disposable);
    }

    const legacyPromoteDisposable = commands.registerCommand(
      `${EXTENSION_ID}.appendToTodoFile`,
      () => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        return this.contextWorkspaceController.promoteSelectionToContextNote();
      },
    );

    this.context.subscriptions.push(legacyPromoteDisposable);
  }

  // --------------------------------------------------------------------------
  // Address navigation
  // --------------------------------------------------------------------------

  /**
   * Registers lightweight operational
   * address navigation capabilities.
   *
   * RESPONSIBILITIES:
   * - Open address command registration
   * - Document link provider registration
   * - Editor-native navigation affordances
   *
   * DOES NOT:
   * - Resolve addresses
   * - Parse references
   * - Navigate files directly
   *
   * Operational behavior belongs to:
   * - AddressNavigationController
   *
   * @private
   * @function registerAddressNavigation
   * @memberof ExtensionRuntime
   */
  private registerAddressNavigation(): void {
    const openAddressDisposable = commands.registerCommand(
      `${EXTENSION_ID}.${CommandIds.OpenAddress}`,
      async (address?: string) => {
        if (!this.isExtensionEnabled()) {
          return;
        }

        await this.addressNavigationController.openAddress(address);
      },
    );

    // Derive tag keywords locally from runtime-configured highlight rules.
    // This preserves distributed runtime authority while aligning the
    // provider's behavior with existing configuration.
    const normalizedRules = getNormalizedHighlightRules(this.config);
    const tagKeywords = normalizedRules
      .map((r) => (r as any).keyword)
      .filter(Boolean) as string[];

    const provider = new AddressLinkProvider(tagKeywords);

    const providerDisposable = languages.registerDocumentLinkProvider(
      ['markdown', 'plaintext'],
      provider,
    );

    this.context.subscriptions.push(openAddressDisposable, providerDisposable);
  }

  // --------------------------------------------------------------------------
  // Tag browser provider
  // --------------------------------------------------------------------------

  /**
   * Creates a lightweight lazy tree provider wrapper.
   *
   * RESPONSIBILITIES:
   * - Tree view delegation
   * - Event forwarding
   * - Provider lifecycle containment
   *
   * DOES NOT:
   * - Implement domain logic
   * - Resolve annotations
   * - Index workspace state
   *
   * Domain behavior belongs to:
   * - TagBrowserProvider
   *
   * @private
   * @function createLazyTagBrowserProvider
   * @memberof ExtensionRuntime
   *
   * @returns {TreeDataProvider<NodeModel> &
   *   Disposable & { refresh(): void }}
   */
  private createLazyTagBrowserProvider(): TreeDataProvider<NodeModel> &
    Disposable & { refresh(): void } {
    const onDidChangeTreeDataEmitter = new EventEmitter<
      NodeModel | undefined | null | void
    >();

    const provider = this.tagBrowserProvider;

    const providerListener = provider.onDidChangeTreeData((event) => {
      onDidChangeTreeDataEmitter.fire(event);
    });

    this.context.subscriptions.push(providerListener);

    return {
      onDidChangeTreeData: onDidChangeTreeDataEmitter.event,

      getTreeItem: (element: NodeModel): TreeItem | Thenable<TreeItem> =>
        provider.getTreeItem(element),

      getChildren: (element?: NodeModel): ProviderResult<NodeModel[]> =>
        provider.getChildren(element),

      refresh(): void {
        provider.refresh();
      },

      dispose(): void {
        providerListener.dispose();

        onDidChangeTreeDataEmitter.dispose();
      },
    };
  }

  // --------------------------------------------------------------------------
  // Highlight synchronization
  // --------------------------------------------------------------------------

  /**
   * Synchronizes active editor highlighting state.
   *
   * RESPONSIBILITIES:
   * - Highlight lifecycle orchestration
   * - Reactive editor synchronization
   * - Highlight listener management
   *
   * Highlighting remains:
   * - editor-native
   * - lightweight
   * - reactive
   * - non-invasive
   *
   * @private
   * @function syncHighlightingState
   * @memberof ExtensionRuntime
   */
  private syncHighlightingState(): void {
    if (!this.config.enable || !this.config.highlightActive) {
      this.disableHighlighting();

      return;
    }

    if (!this.highlightController) {
      this.highlightController = new HighlightController(this.config);
    } else {
      this.highlightController.refreshConfiguration();
    }

    if (this.highlightListeners.length === 0) {
      const updateHighlighting = (): void => {
        const activeEditor = window.activeTextEditor;

        if (
          !activeEditor ||
          !this.isExtensionEnabled() ||
          !this.config.highlightActive
        ) {
          return;
        }

        this.highlightController.updateHighlighting(activeEditor);
      };

      const debouncedUpdate = debounce(updateHighlighting, 200);

      this.highlightListeners.push(
        window.onDidChangeActiveTextEditor(updateHighlighting),

        window.onDidChangeTextEditorVisibleRanges((event) => {
          const activeEditor = window.activeTextEditor;

          if (activeEditor && event.textEditor === activeEditor) {
            debouncedUpdate();
          }
        }),

        workspace.onDidChangeTextDocument((event) => {
          const activeEditor = window.activeTextEditor;

          if (activeEditor && event.document === activeEditor.document) {
            debouncedUpdate();
          }
        }),
      );

      this.context.subscriptions.push(...this.highlightListeners);
    }

    const activeEditor = window.activeTextEditor;

    if (activeEditor) {
      this.highlightController.updateHighlighting(activeEditor);
    }
  }

  /**
   * Disables active editor highlighting.
   *
   * RESPONSIBILITIES:
   * - Listener disposal
   * - Highlight cleanup
   * - Reactive lifecycle teardown
   *
   * @private
   * @function disableHighlighting
   * @memberof ExtensionRuntime
   */
  private disableHighlighting(): void {
    if (this.highlightListeners.length > 0) {
      for (const listener of this.highlightListeners) {
        listener.dispose();
      }

      this.highlightListeners = [];
    }

    if (this.highlightController && window.activeTextEditor) {
      this.highlightController.clearHighlighting(window.activeTextEditor);
    }

    this.highlightController = undefined as never;
  }
}
