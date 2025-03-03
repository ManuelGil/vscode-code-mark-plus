import { WorkspaceConfiguration } from 'vscode';

import { CommentTemplate, HighlightRule } from '../types';
import {
  DEFAULT_ADD_EMPTY_LINE_AFTER_LOG_SETTING,
  DEFAULT_ADD_EMPTY_LINE_BEFORE_LOG_MESSAGE_SETTING,
  DEFAULT_AUTHOR_SETTING,
  DEFAULT_CUSTOM_LOG_TEMPLATES,
  DEFAULT_ENABLE_SETTING,
  DEFAULT_HIGHLIGHT_ACTIVE_SETTING,
  DEFAULT_HIGHLIGHT_RULES,
  DEFAULT_LANGUAGE_SETTING,
  DEFAULT_LICENSE_SETTING,
  DEFAULT_LITERAL_CLOSE_SETTING,
  DEFAULT_LITERAL_OPEN_SETTING,
  DEFAULT_LOG_MESSAGE_PREFIX,
  DEFAULT_LOG_MESSAGE_WRAPPED_SETTING,
  DEFAULT_MESSAGE_LOG_DELIMITER,
  DEFAULT_MESSAGE_LOG_SUFFIX,
  DEFAULT_SPECIAL_HIGHLIGHT_DECORATION,
  DEFAULT_USE_CURRENT_INDENT_SETTING,
  DEFAULT_VERSION_SETTING,
} from './constants.config';

/**
 * The Config class.
 *
 * @class
 * @classdesc The class that represents the configuration of the extension.
 * @export
 * @public
 * @property {WorkspaceConfiguration} config - The workspace configuration
 * @example
 * const config = new Config(workspace.getConfiguration());
 * console.log(config.includeExtensionOnExport);
 * console.log(config.exclude);
 */
export class ExtensionConfig {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Public properties

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
   * Default language to be used for logging.
   * @type {string}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.defaultLanguage);
   * @default "javascript"
   */
  defaultLanguage: string;

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
   * @type {Object}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.specialHighlightDecoration);
   * @default {}
   */
  specialHighlightDecoration: Object;

  /**
   * Custom comment templates for different languages. You can define a template per language using available variables (e.g., {{{logCommand}}}, {{{commentMessagePrefix}}}, {{{variableName}}}, {{{filename}}}).
   * @type {CommentTemplate[]}
   * @public
   * @memberof ExtensionConfig
   * @example
   * console.log(config.customTemplates);
   * @default
   * ```typescript
   * []
   * ```
   * @default []
   */
  customTemplates: CommentTemplate[];

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the Config class.
   *
   * @constructor
   * @param {WorkspaceConfiguration} config - The workspace configuration
   * @public
   * @memberof Config
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
      DEFAULT_LOG_MESSAGE_WRAPPED_SETTING,
    );
    // Delimiter to separate different elements inside the comment (e.g., filename, line number, class, function, variable).
    this.commentDelimiter = config.get<string>(
      'commentDelimiter',
      DEFAULT_MESSAGE_LOG_DELIMITER,
    );
    // Prefix added at the beginning of the comment.
    this.commentMessagePrefix = config.get<string>(
      'commentMessagePrefix',
      DEFAULT_LOG_MESSAGE_PREFIX,
    );
    // Suffix added at the end of the comment.
    this.commentMessageSuffix = config.get<string>(
      'commentMessageSuffix',
      DEFAULT_MESSAGE_LOG_SUFFIX,
    );
    // Insert an empty line before the comment for improved readability.
    this.addEmptyLineBeforeComment = config.get<boolean>(
      'addEmptyLineBeforeComment',
      DEFAULT_ADD_EMPTY_LINE_BEFORE_LOG_MESSAGE_SETTING,
    );
    // Insert an empty line after the comment for improved readability.
    this.addEmptyLineAfterComment = config.get<boolean>(
      'addEmptyLineAfterComment',
      DEFAULT_ADD_EMPTY_LINE_AFTER_LOG_SETTING,
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
      'useCurrentIndent',
      DEFAULT_USE_CURRENT_INDENT_SETTING,
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
    // Highlight rule for the comments.
    this.highlightRules = config.get<HighlightRule[]>(
      'highlightRules',
      DEFAULT_HIGHLIGHT_RULES,
    );
    // Special highlight decoration for the comments.
    this.specialHighlightDecoration = config.get<Object>(
      'specialHighlightDecoration',
      DEFAULT_SPECIAL_HIGHLIGHT_DECORATION,
    );
    // Custom comment templates for different languages. You can define a template per language using available variables (e.g., {{{logCommand}}}, {{{commentMessagePrefix}}}, {{{variableName}}}, {{{fileName}}}).
    this.customTemplates = config.get<CommentTemplate[]>(
      'customTemplates',
      DEFAULT_CUSTOM_LOG_TEMPLATES,
    );
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
    // Enable or disable the extension.
    this.enable = config.get<boolean>('enable', this.enable);
    // Default language to be used for logging.
    this.defaultLanguage = config.get<string>(
      'defaultLanguage',
      this.defaultLanguage,
    );
    // Determine whether to wrap the comment with additional formatting or markers
    this.isCommentMessageWrapped = config.get<boolean>(
      'isCommentMessageWrapped',
      this.isCommentMessageWrapped,
    );
    // Prefix added at the beginning of the comment.
    this.commentMessagePrefix = config.get<string>(
      'commentMessagePrefix',
      this.commentMessagePrefix,
    );
    // Delimiter to separate different elements inside the comment (e.g., filename, line number, class, function, variable).
    this.commentDelimiter = config.get<string>(
      'commentDelimiter',
      this.commentDelimiter,
    );
    // Suffix added at the end of the comment.
    this.commentMessageSuffix = config.get<string>(
      'commentMessageSuffix',
      this.commentMessageSuffix,
    );
    // Insert an empty line before the comment for improved readability.
    this.addEmptyLineBeforeComment = config.get<boolean>(
      'addEmptyLineBeforeComment',
      this.addEmptyLineBeforeComment,
    );
    // Insert an empty line after the comment for improved readability.
    this.addEmptyLineAfterComment = config.get<boolean>(
      'addEmptyLineAfterComment',
      this.addEmptyLineAfterComment,
    );
    // The literal open characters for the comment.
    this.literalOpen = config.get<string>('literalOpen', this.literalOpen);
    // The literal close characters for the comment.
    this.literalClose = config.get<string>('literalClose', this.literalClose);
    // Whether to use the current position for the comment.
    this.useCurrentPosition = config.get<boolean>(
      'useCurrentIndent',
      this.useCurrentPosition,
    );
    // The author for the comment.
    this.author = config.get<string>('author', this.author);
    // The version for the comment.
    this.version = config.get<string>('version', this.version);
    // The license for the comment.
    this.license = config.get<string>('license', this.license);
    // Highlight active state for the comments.
    this.highlightActive = config.get<boolean>(
      'highlightActive',
      this.highlightActive,
    );
    // Highlight rule for the comments.
    this.highlightRules = config.get<HighlightRule[]>(
      'highlightRules',
      this.highlightRules,
    );
    // Special highlight decoration for the comments.
    this.specialHighlightDecoration = config.get<Object>(
      'specialHighlightDecoration',
      this.specialHighlightDecoration,
    );
    // Custom comment templates for different languages. You can define a template per language using available variables (e.g., {{{logCommand}}}, {{{commentMessagePrefix}}}, {{{variableName}}}, {{{fileName}}}).
    this.customTemplates = config.get<CommentTemplate[]>(
      'customTemplates',
      this.customTemplates,
    );
  }
}
