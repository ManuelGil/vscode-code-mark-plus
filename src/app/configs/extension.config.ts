import { DecorationRenderOptions, WorkspaceConfiguration } from 'vscode';

import { CommentTemplate, HighlightRule } from '../types';
import {
  DEFAULT_ADD_EMPTY_LINE_AFTER_COMMENT_SETTING,
  DEFAULT_ADD_EMPTY_LINE_BEFORE_COMMENT_MESSAGE_SETTING,
  DEFAULT_AUTHOR_SETTING,
  DEFAULT_BATCH_SIZE,
  DEFAULT_COMMENT_MESSAGE_PREFIX,
  DEFAULT_COMMENT_MESSAGE_WRAPPED_SETTING,
  DEFAULT_CONCURRENCY_LIMIT,
  DEFAULT_CREATE_DEFAULT_FILES_SETTING,
  DEFAULT_CUSTOM_COMMENT_TEMPLATES,
  DEFAULT_ENABLE_SETTING,
  DEFAULT_EXCLUDED_FILE_PATTERNS,
  DEFAULT_HIGHLIGHT_ACTIVE_SETTING,
  DEFAULT_HIGHLIGHT_RULES,
  DEFAULT_INCLUDED_FILE_PATTERNS,
  DEFAULT_LANGUAGE_SETTING,
  DEFAULT_LICENSE_SETTING,
  DEFAULT_LITERAL_CLOSE_SETTING,
  DEFAULT_LITERAL_OPEN_SETTING,
  DEFAULT_MAX_FILES_TO_INDEX,
  DEFAULT_MAX_SEARCH_RECURSION_DEPTH,
  DEFAULT_MESSAGE_COMMENT_DELIMITER,
  DEFAULT_MESSAGE_COMMENT_SUFFIX,
  DEFAULT_NOTES_FOLDER,
  DEFAULT_PRESERVE_GITIGNORE_SETTINGS,
  DEFAULT_SCRATCHPAD_FILE_NAME,
  DEFAULT_SHOW_FILE_PATH_IN_RESULTS,
  DEFAULT_SPECIAL_HIGHLIGHT_DECORATION,
  DEFAULT_SUPPORTS_HIDDEN_FILES,
  DEFAULT_TAG_PROFILES,
  DEFAULT_TODO_FILE_NAME,
  DEFAULT_USE_CURRENT_POSITION_SETTING,
  DEFAULT_VERSION_SETTING,
} from './constants.config';

/**
 * The ExtensionConfig class.
 *
 * @class
 * @classdesc The class that represents the configuration of the extension.
 * Groups related settings into logical categories for better organization and maintenance.
 * @export
 * @public
 * @property {WorkspaceConfiguration} config - The workspace configuration
 * @example
 * const config = new ExtensionConfig(workspace.getConfiguration());
 * console.log(config.enable);
 * console.log(config.defaultLanguage);
 */
export class ExtensionConfig {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // =====================================================================
  // CORE SETTINGS
  // =====================================================================

  /**
   * Settings related to core extension functionality
   */

  /**
   * Enable or disable the extension.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.enable);
   * @default true
   */
  enable: boolean;

  /**
   * The workspace selection.
   * @type {string | undefined}
   * @public
   * @memberof ExtensionConfig
   * @example
   * const config = new Config(workspace.getConfiguration());
   * console.log(config.workspaceSelection);
   */
  workspaceSelection: string | undefined;

  /**
   * Default language to be used for logging.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.defaultLanguage);
   * @default "javascript"
   */
  defaultLanguage: string;

  // =====================================================================
  // COMMENT FORMATTING SETTINGS
  // =====================================================================

  /**
   * Settings related to comment formatting and appearance
   */

  /**
   * Determine whether to wrap the comment with additional formatting or markers.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.isCommentMessageWrapped);
   * @default false
   */
  isCommentMessageWrapped: boolean;

  /**
   * Delimiter to separate different elements inside the comment (e.g., filename, line number, class, function, variable).
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.commentDelimiter);
   * @default "~"
   */
  commentDelimiter: string;

  /**
   * Prefix added at the beginning of the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.commentMessagePrefix);
   * @default "🔹"
   */
  commentMessagePrefix: string;

  /**
   * Suffix added at the end of the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.commentMessageSuffix);
   * @default ":"
   */
  commentMessageSuffix: string;

  /**
   * Insert an empty line before the comment for improved readability.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.addEmptyLineBeforeComment);
   * @default false
   */
  addEmptyLineBeforeComment: boolean;

  /**
   * Insert an empty line after the comment for improved readability.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.addEmptyLineAfterComment);
   * @default false
   */
  addEmptyLineAfterComment: boolean;

  /**
   * The literal open characters for the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.literalOpen);
   * @default "{"
   */
  literalOpen: string;

  /**
   * The literal close characters for the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.literalClose);
   * @default "}"
   */
  literalClose: string;

  /**
   * Whether to use the current position for the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.useCurrentIndent);
   * @default false
   */
  useCurrentPosition: boolean;

  // =====================================================================
  // METADATA SETTINGS
  // =====================================================================

  /**
   * Settings related to comment metadata and attribution
   */

  /**
   * The author for the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.author);
   * @default "Unknown"
   */
  author: string;

  /**
   * The version for the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.version);
   * @default "1.0.0"
   */
  version: string;

  /**
   * The license for the comment.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.license);
   * @default "MIT"
   */
  license: string;

  // =====================================================================
  // HIGHLIGHTING SETTINGS
  // =====================================================================

  /**
   * Settings related to code highlighting and decoration
   */

  /**
   * Highlight active state for the comments.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.highlightActive);
   * @default true
   */
  highlightActive: boolean;

  /**
   * Highlight rule for the comments.
   * @type {HighlightRule[]}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.highlightRules);
   * @default []
   */
  highlightRules: HighlightRule[];

  /**
   * Special highlight decoration for the comments.
   * @type {DecorationRenderOptions}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.specialHighlightDecoration);
   * @default {}
   */
  specialHighlightDecoration: DecorationRenderOptions;

  // =====================================================================
  // TEMPLATE SETTINGS
  // =====================================================================

  /**
   * Settings related to comment templates and formatting rules
   */

  /**
   * Custom comment templates for different languages. You can define a template per language using available variables (e.g., {{{logCommand}}}, {{{commentMessagePrefix}}}, {{{variableName}}}, {{{filename}}}).
   * @type {CommentTemplate[]}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.customTemplates);
   * @default []
   */
  customTemplates: CommentTemplate[];

  // =====================================================================
  // FILE SYSTEM SETTINGS
  // =====================================================================

  /**
   * Settings related to file system operations and filtering
   */

  /**
   * Glob patterns for files to include in the extension's file operations (e.g., for tree views and search).
   * @type {string[]}
   * @public
   * @memberof ExtensionConfig
   * @example console.log(config.includedFilePatterns);
   */
  includedFilePatterns: string[];

  /**
   * Glob patterns for files to exclude from the extension's file operations.
   * @type {string[]}
   * @public
   * @memberof ExtensionConfig
   */
  excludedFilePatterns: string[];

  /**
   * Maximum recursion depth for file search (0 = unlimited).
   * @type {number}
   * @public
   * @memberof ExtensionConfig
   * @example console.log(config.maxSearchRecursionDepth);
   */
  maxSearchRecursionDepth: number;

  /**
   * Whether to include hidden files in search operations.
   * @example console.log(config.supportsHiddenFiles);
   */
  supportsHiddenFiles: boolean;

  /**
   * Whether to respect .gitignore settings during file search.
   * @example console.log(config.preserveGitignoreSettings);
   */
  preserveGitignoreSettings: boolean;

  /**
   * Whether to show the file path in the search results.
   * @example console.log(config.showFilePathInResults);
   */
  showFilePathInResults: boolean;

  // =====================================================================
  // NOTES AND TODO SETTINGS
  // =====================================================================

  /**
   * Settings related to project notes and todo management
   */

  /**
   * Default folder name for project notes.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.notesFolder);
   * @default '.codemark'
   */
  notesFolder: string;

  /**
   * Whether to create default notes files automatically.
   * @type {boolean}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.createDefaultFiles);
   * @default true
   */
  createDefaultFiles: boolean;

  /**
   * Default filename for project TODO list.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.todoFileName);
   * @default '(TODO).md'
   */
  todoFileName: string;

  /**
   * Default filename for project scratchpad.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.scratchpadFileName);
   * @default '(Scratchpad).md'
   */
  scratchpadFileName: string;

  // =====================================================================
  // TAG SETTINGS
  // =====================================================================

  /**
   * Settings related to tag management and indexing
   */

  /**
   * Default tag profiles mapping.
   * @type {Record<string, { priority: number; icon?: string; color?: string }>}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.tagProfiles);
   * @default {}
   */
  tagProfiles: Record<
    string,
    { priority: number; icon?: string; color?: string }
  >;

  // =====================================================================
  // PERFORMANCE SETTINGS
  // =====================================================================

  /**
   * Settings related to performance optimization
   */

  /**
   * Maximum number of files to index for better performance.
   * @type {number}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.maxFilesToIndex);
   * @default 1000
   */
  maxFilesToIndex: number;

  /**
   * Maximum number of files to process concurrently during indexing.
   * @type {number}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.concurrencyLimit);
   * @default 10
   */
  concurrencyLimit: number;

  /**
   * Number of files to process in each batch.
   * @type {number}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.batchSize);
   * @default 10
   */
  batchSize: number;

  // =====================================================================
  // FEATURE SETTINGS
  // =====================================================================

  /**
   * Settings related to specific extension features
   */

  /**
   * List of custom actions for the Quick Actions menu.
   * @type {Array<{name: string; command: string; args?: unknown[]; shortcut?: string; icon?: string}>}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.quickActions);
   * @default []
   */
  quickActions: Array<{
    name: string;
    command: string;
    args?: unknown[];
    shortcut?: string;
    icon?: string;
  }>;

  /**
   * List of tag priorities for sorting in the Tag Browser.
   * @type {Array<{tag: string; priority: number; color?: string; icon?: string}>}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.tagPriorities);
   * @default []
   */
  tagPriorities: Array<{
    tag: string;
    priority: number;
    color?: string;
    icon?: string;
  }>;

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the ExtensionConfig class.
   * Initializes all configuration properties from workspace settings with default values.
   *
   * @constructor
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof ExtensionConfig
   */
  constructor(readonly config: WorkspaceConfiguration) {
    // Enable or disable the extension.
    this.enable = config.get<boolean>('enable', DEFAULT_ENABLE_SETTING);
    // Default language to be used for logging.
    this.defaultLanguage = config.get<string>(
      'defaultLanguage',
      DEFAULT_LANGUAGE_SETTING,
    );
    // Determine whether to wrap the comment with additional formatting or markers
    this.isCommentMessageWrapped = config.get<boolean>(
      'isCommentMessageWrapped',
      DEFAULT_COMMENT_MESSAGE_WRAPPED_SETTING,
    );
    // Delimiter to separate different elements inside the comment (e.g., filename, line number, class, function, variable).
    this.commentDelimiter = config.get<string>(
      'commentDelimiter',
      DEFAULT_MESSAGE_COMMENT_DELIMITER,
    );
    // Prefix added at the beginning of the comment.
    this.commentMessagePrefix = config.get<string>(
      'commentMessagePrefix',
      DEFAULT_COMMENT_MESSAGE_PREFIX,
    );
    // Suffix added at the end of the comment.
    this.commentMessageSuffix = config.get<string>(
      'commentMessageSuffix',
      DEFAULT_MESSAGE_COMMENT_SUFFIX,
    );
    // Insert an empty line before the comment for improved readability.
    this.addEmptyLineBeforeComment = config.get<boolean>(
      'addEmptyLineBeforeComment',
      DEFAULT_ADD_EMPTY_LINE_BEFORE_COMMENT_MESSAGE_SETTING,
    );
    // Insert an empty line after the comment for improved readability.
    this.addEmptyLineAfterComment = config.get<boolean>(
      'addEmptyLineAfterComment',
      DEFAULT_ADD_EMPTY_LINE_AFTER_COMMENT_SETTING,
    );
    // The literal open characters for the comment.
    this.literalOpen = config.get<string>(
      'literalOpen',
      DEFAULT_LITERAL_OPEN_SETTING,
    );
    // The literal close characters for the comment.
    this.literalClose = config.get<string>(
      'literalClose',
      DEFAULT_LITERAL_CLOSE_SETTING,
    );
    // Whether to use the current position for the comment.
    this.useCurrentPosition = config.get<boolean>(
      'useCurrentPosition',
      DEFAULT_USE_CURRENT_POSITION_SETTING,
    );
    // The author for the comment.
    this.author = config.get<string>('author', DEFAULT_AUTHOR_SETTING);
    // The version for the comment.
    this.version = config.get<string>('version', DEFAULT_VERSION_SETTING);
    // The license for the comment.
    this.license = config.get<string>('license', DEFAULT_LICENSE_SETTING);
    // Highlight active state for the comments.
    this.highlightActive = config.get<boolean>(
      'highlightActive',
      DEFAULT_HIGHLIGHT_ACTIVE_SETTING,
    );
    // Highlight rules (raw). Normalization is delegated to helpers/consumers.
    this.highlightRules = config.get<HighlightRule[]>(
      'highlightRules',
      DEFAULT_HIGHLIGHT_RULES,
    );
    // Special highlight decoration for the comments.
    this.specialHighlightDecoration = config.get<DecorationRenderOptions>(
      'specialHighlightDecoration',
      DEFAULT_SPECIAL_HIGHLIGHT_DECORATION,
    );
    // Custom comment templates for different languages. You can define a template per language using available variables (e.g., {{{logCommand}}}, {{{commentMessagePrefix}}}, {{{variableName}}}, {{{fileName}}}).
    this.customTemplates = config.get<CommentTemplate[]>(
      'customTemplates',
      DEFAULT_CUSTOM_COMMENT_TEMPLATES,
    );
    // Glob patterns for files to include in the extension's file operations
    this.includedFilePatterns = config.get<string[]>(
      'files.includedFilePatterns',
      DEFAULT_INCLUDED_FILE_PATTERNS,
    );
    // Glob patterns for files to exclude from the extension's file operations
    this.excludedFilePatterns = config.get<string[]>(
      'files.excludedFilePatterns',
      DEFAULT_EXCLUDED_FILE_PATTERNS,
    );
    // Maximum recursion depth for file search
    this.maxSearchRecursionDepth = config.get<number>(
      'files.maxSearchRecursionDepth',
      DEFAULT_MAX_SEARCH_RECURSION_DEPTH,
    );
    // Whether to include hidden files in search operations
    this.supportsHiddenFiles = config.get<boolean>(
      'files.supportsHiddenFiles',
      DEFAULT_SUPPORTS_HIDDEN_FILES,
    );
    // Whether to respect .gitignore settings during file search
    this.preserveGitignoreSettings = config.get<boolean>(
      'files.preserveGitignoreSettings',
      DEFAULT_PRESERVE_GITIGNORE_SETTINGS,
    );
    // Whether to show the file path in the search results
    this.showFilePathInResults = config.get<boolean>(
      'files.showFilePathInResults',
      DEFAULT_SHOW_FILE_PATH_IN_RESULTS,
    );

    // =====================================================================
    // NOTES AND TODO SETTINGS
    // =====================================================================

    // Default folder name for project notes.
    this.notesFolder = config.get<string>(
      'notes.notesFolder',
      DEFAULT_NOTES_FOLDER,
    );
    // Whether to create default notes files automatically.
    this.createDefaultFiles = config.get<boolean>(
      'notes.createDefaultFiles',
      DEFAULT_CREATE_DEFAULT_FILES_SETTING,
    );
    // Default filename for project TODO list.
    this.todoFileName = config.get<string>(
      'notes.todoFileName',
      DEFAULT_TODO_FILE_NAME,
    );
    // Default filename for project scratchpad.
    this.scratchpadFileName = config.get<string>(
      'notes.scratchpadFileName',
      DEFAULT_SCRATCHPAD_FILE_NAME,
    );
    // =====================================================================
    // TAG SETTINGS
    // =====================================================================

    // Default tag profiles mapping.
    this.tagProfiles = config.get<
      Record<string, { priority: number; icon?: string; color?: string }>
    >('tags.tagProfiles', DEFAULT_TAG_PROFILES);

    // =====================================================================
    // PERFORMANCE SETTINGS
    // =====================================================================

    // Maximum number of files to index for better performance.
    this.maxFilesToIndex = config.get<number>(
      'performance.maxFilesToIndex',
      DEFAULT_MAX_FILES_TO_INDEX,
    );
    // Maximum number of files to process concurrently during indexing.
    this.concurrencyLimit = config.get<number>(
      'performance.concurrencyLimit',
      DEFAULT_CONCURRENCY_LIMIT,
    );
    // Number of files to process in each batch.
    this.batchSize = config.get<number>(
      'performance.batchSize',
      DEFAULT_BATCH_SIZE,
    );

    // =====================================================================
    // FEATURE SETTINGS
    // =====================================================================

    // List of custom actions for the Quick Actions menu.
    this.quickActions = config.get<
      Array<{
        name: string;
        command: string;
        args?: unknown[];
        shortcut?: string;
        icon?: string;
      }>
    >('features.quickActions', []);
    // List of tag priorities for sorting in the Tag Browser.
    this.tagPriorities = config.get<
      Array<{ tag: string; priority: number; color?: string; icon?: string }>
    >('tags.tagPriorities', []);
  }

  // -----------------------------------------------------------------
  // Getters for grouped settings
  // -----------------------------------------------------------------

  /**
   * Core settings getter.
   * @returns Core configuration settings
   */
  get core(): { enable: boolean; defaultLanguage: string } {
    return {
      enable: this.enable,
      defaultLanguage: this.defaultLanguage,
    };
  }

  /**
   * Comment formatting settings getter.
   * @returns Comment formatting configuration settings
   */
  get commentFormatting(): {
    isCommentMessageWrapped: boolean;
    commentDelimiter: string;
    commentMessagePrefix: string;
    commentMessageSuffix: string;
    addEmptyLineBeforeComment: boolean;
    addEmptyLineAfterComment: boolean;
    literalOpen: string;
    literalClose: string;
    useCurrentPosition: boolean;
  } {
    return {
      isCommentMessageWrapped: this.isCommentMessageWrapped,
      commentDelimiter: this.commentDelimiter,
      commentMessagePrefix: this.commentMessagePrefix,
      commentMessageSuffix: this.commentMessageSuffix,
      addEmptyLineBeforeComment: this.addEmptyLineBeforeComment,
      addEmptyLineAfterComment: this.addEmptyLineAfterComment,
      literalOpen: this.literalOpen,
      literalClose: this.literalClose,
      useCurrentPosition: this.useCurrentPosition,
    };
  }

  /**
   * Metadata settings getter.
   * @returns Metadata configuration settings
   */
  get metadata(): { author: string; version: string; license: string } {
    return {
      author: this.author,
      version: this.version,
      license: this.license,
    };
  }

  /**
   * Highlighting settings getter.
   * @returns Highlighting configuration settings
   */
  get highlighting(): {
    highlightActive: boolean;
    highlightRules: HighlightRule[];
    specialHighlightDecoration: DecorationRenderOptions;
  } {
    return {
      highlightActive: this.highlightActive,
      highlightRules: this.highlightRules,
      specialHighlightDecoration: this.specialHighlightDecoration,
    };
  }

  /**
   * Files settings getter.
   * @returns Files configuration settings
   */
  get files(): {
    includedFilePatterns: string[];
    excludedFilePatterns: string[];
    maxSearchRecursionDepth: number;
    supportsHiddenFiles: boolean;
    preserveGitignoreSettings: boolean;
    showFilePathInResults: boolean;
  } {
    return {
      includedFilePatterns: this.includedFilePatterns,
      excludedFilePatterns: this.excludedFilePatterns,
      maxSearchRecursionDepth: this.maxSearchRecursionDepth,
      supportsHiddenFiles: this.supportsHiddenFiles,
      preserveGitignoreSettings: this.preserveGitignoreSettings,
      showFilePathInResults: this.showFilePathInResults,
    };
  }

  /**
   * Notes settings getter.
   * @returns Notes configuration settings
   */
  get notes(): {
    notesFolder: string;
    createDefaultFiles: boolean;
    todoFileName: string;
    scratchpadFileName: string;
  } {
    return {
      notesFolder: this.notesFolder,
      createDefaultFiles: this.createDefaultFiles,
      todoFileName: this.todoFileName,
      scratchpadFileName: this.scratchpadFileName,
    };
  }

  /**
   * Tags settings getter.
   * @returns Tags configuration settings
   */
  get tags(): {
    tagProfiles: Record<
      string,
      { priority: number; icon?: string; color?: string }
    >;
    tagPriorities: Array<{
      tag: string;
      priority: number;
      color?: string;
      icon?: string;
    }>;
  } {
    return {
      tagProfiles: this.tagProfiles,
      tagPriorities: this.tagPriorities,
    };
  }

  /**
   * Performance settings getter.
   * @returns Performance configuration settings
   */
  get performance(): {
    maxFilesToIndex: number;
    concurrencyLimit: number;
    batchSize: number;
  } {
    return {
      maxFilesToIndex: this.maxFilesToIndex,
      concurrencyLimit: this.concurrencyLimit,
      batchSize: this.batchSize,
    };
  }

  /**
   * Features settings getter.
   * @returns Features configuration settings
   */
  get features(): {
    quickActions: Array<{
      name: string;
      command: string;
      args?: unknown[];
      shortcut?: string;
      icon?: string;
    }>;
  } {
    return {
      quickActions: this.quickActions,
    };
  }

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods
  /**
   * The update method.
   *
   * @function update
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof Config
   * @example
   * const config = new Config(workspace.getConfiguration());
   * config.update(workspace.getConfiguration());
   */
  update(config: WorkspaceConfiguration): void {
    // =====================================================================
    // CORE SETTINGS
    // =====================================================================

    // Enable or disable the extension
    this.enable = config.get<boolean>('enable', this.enable);

    // Default language to be used for logging
    this.defaultLanguage = config.get<string>(
      'defaultLanguage',
      this.defaultLanguage,
    );

    // =====================================================================
    // COMMENT FORMATTING SETTINGS
    // =====================================================================

    // Determine whether to wrap the comment with additional formatting or markers
    this.isCommentMessageWrapped = config.get<boolean>(
      'isCommentMessageWrapped',
      this.isCommentMessageWrapped,
    );

    // Prefix added at the beginning of the comment
    this.commentMessagePrefix = config.get<string>(
      'commentMessagePrefix',
      this.commentMessagePrefix,
    );

    // Delimiter to separate different elements inside the comment
    this.commentDelimiter = config.get<string>(
      'commentDelimiter',
      this.commentDelimiter,
    );

    // Suffix added at the end of the comment
    this.commentMessageSuffix = config.get<string>(
      'commentMessageSuffix',
      this.commentMessageSuffix,
    );

    // Insert an empty line before the comment for improved readability
    this.addEmptyLineBeforeComment = config.get<boolean>(
      'addEmptyLineBeforeComment',
      this.addEmptyLineBeforeComment,
    );

    // Insert an empty line after the comment for improved readability
    this.addEmptyLineAfterComment = config.get<boolean>(
      'addEmptyLineAfterComment',
      this.addEmptyLineAfterComment,
    );

    // The literal open characters for the comment
    this.literalOpen = config.get<string>('literalOpen', this.literalOpen);

    // The literal close characters for the comment
    this.literalClose = config.get<string>('literalClose', this.literalClose);

    // Whether to use the current position for the comment
    this.useCurrentPosition = config.get<boolean>(
      'useCurrentPosition',
      this.useCurrentPosition,
    );

    // =====================================================================
    // METADATA SETTINGS
    // =====================================================================

    // The author for the comment
    this.author = config.get<string>('author', this.author);

    // The version for the comment
    this.version = config.get<string>('version', this.version);

    // The license for the comment
    this.license = config.get<string>('license', this.license);

    // =====================================================================
    // HIGHLIGHTING SETTINGS
    // =====================================================================

    // Highlight active state for the comments
    this.highlightActive = config.get<boolean>(
      'highlightActive',
      this.highlightActive,
    );

    // Highlight rules (raw). Normalization is delegated to helpers/consumers
    this.highlightRules = config.get<HighlightRule[]>(
      'highlightRules',
      this.highlightRules,
    );

    // Special highlight decoration for the comments
    this.specialHighlightDecoration = config.get<DecorationRenderOptions>(
      'specialHighlightDecoration',
      this.specialHighlightDecoration,
    );

    // =====================================================================
    // TEMPLATE SETTINGS
    // =====================================================================

    // Custom comment templates for different languages
    this.customTemplates = config.get<CommentTemplate[]>(
      'customTemplates',
      this.customTemplates,
    );

    // =====================================================================
    // FILE SYSTEM SETTINGS
    // =====================================================================

    // Glob patterns for files to include in the extension's file operations
    this.includedFilePatterns = config.get<string[]>(
      'files.includedFilePatterns',
      this.includedFilePatterns,
    );

    // Glob patterns for files to exclude from the extension's file operations
    this.excludedFilePatterns = config.get<string[]>(
      'files.excludedFilePatterns',
      this.excludedFilePatterns,
    );

    // Maximum recursion depth for file search
    this.maxSearchRecursionDepth = config.get<number>(
      'files.maxSearchRecursionDepth',
      this.maxSearchRecursionDepth,
    );

    // Whether to include hidden files in search operations
    this.supportsHiddenFiles = config.get<boolean>(
      'files.supportsHiddenFiles',
      this.supportsHiddenFiles,
    );

    // Whether to respect .gitignore settings during file search
    this.preserveGitignoreSettings = config.get<boolean>(
      'files.preserveGitignoreSettings',
      this.preserveGitignoreSettings,
    );

    // Whether to show the file path in the search results
    this.showFilePathInResults = config.get<boolean>(
      'files.showFilePathInResults',
      this.showFilePathInResults,
    );

    // =====================================================================
    // NOTES AND TODO SETTINGS
    // =====================================================================

    // Default folder name for project notes
    this.notesFolder = config.get<string>(
      'notes.notesFolder',
      this.notesFolder,
    );

    // Whether to create default notes files automatically
    this.createDefaultFiles = config.get<boolean>(
      'notes.createDefaultFiles',
      this.createDefaultFiles,
    );

    // Default filename for project TODO list
    this.todoFileName = config.get<string>(
      'notes.todoFileName',
      this.todoFileName,
    );

    // Default filename for project scratchpad
    this.scratchpadFileName = config.get<string>(
      'notes.scratchpadFileName',
      this.scratchpadFileName,
    );

    // =====================================================================
    // TAG SETTINGS
    // =====================================================================

    // Default tag profiles mapping
    this.tagProfiles = config.get<
      Record<string, { priority: number; icon?: string; color?: string }>
    >('tags.tagProfiles', this.tagProfiles);

    // List of tag priorities for sorting in the Tag Browser
    this.tagPriorities = config.get<
      Array<{ tag: string; priority: number; color?: string; icon?: string }>
    >('tags.tagPriorities', this.tagPriorities);

    // =====================================================================
    // PERFORMANCE SETTINGS
    // =====================================================================

    // Maximum number of files to index for better performance
    this.maxFilesToIndex = config.get<number>(
      'performance.maxFilesToIndex',
      this.maxFilesToIndex,
    );

    // Maximum number of files to process concurrently during indexing
    this.concurrencyLimit = config.get<number>(
      'performance.concurrencyLimit',
      this.concurrencyLimit,
    );

    // Number of files to process in each batch
    this.batchSize = config.get<number>(
      'performance.batchSize',
      this.batchSize,
    );

    // =====================================================================
    // FEATURE SETTINGS
    // =====================================================================

    // List of custom actions for the Quick Actions menu
    this.quickActions = config.get<
      Array<{
        name: string;
        command: string;
        args?: unknown[];
        shortcut?: string;
        icon?: string;
      }>
    >('features.quickActions', this.quickActions);
  }
}
