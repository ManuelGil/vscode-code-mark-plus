import { DecorationRenderOptions } from 'vscode';
import { CommentTemplate, HighlightRule } from '../types';

/**
 * EXTENSION_ID: The unique identifier of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_ID);
 *
 * @returns {string} - The unique identifier of the extension
 */
export const EXTENSION_ID: string = 'codeMarkPlus';

/**
 * EXTENSION_NAME: The repository ID of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_NAME);
 *
 * @returns {string} - The repository ID of the extension
 */
export const EXTENSION_NAME: string = 'vscode-code-mark-plus';

/**
 * EXTENSION_DISPLAY_NAME: The name of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(EXTENSION_DISPLAY_NAME);
 *
 * @returns {string} - The name of the extension
 */
export const EXTENSION_DISPLAY_NAME: string = 'CodeMark+';

/**
 * USER_NAME: The ManuelGil of the extension.
 * @type {string}
 * console.log(USER_NAME);
 *
 * @returns {string} - The ManuelGil of the extension
 * @category Config
 */
export const USER_NAME: string = 'ManuelGil';

/**
 * USER_PUBLISHER: The publisher of the extension.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(USER_PUBLISHER);
 *
 * @returns {string} - The publisher of the extension
 */
export const USER_PUBLISHER: string = 'imgildev';

/**
 * REPOSITORY_URL: The documentation URL of the extension.
 * @type {string}
 * console.log(REPOSITORY_URL);
 *
 * @returns {string} - The documentation URL of the extension
 * @category Config
 */
export const REPOSITORY_URL: string = `https://github.com/${USER_NAME}/${EXTENSION_NAME}`;

/**
 * DEFAULT_ENABLE_SETTING: The default value for the enable setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_ENABLE_SETTING);
 *
 * @returns {boolean} - The default value for the enable setting
 */
export const DEFAULT_ENABLE_SETTING: boolean = true;

/**
 * DEFAULT_LANGUAGE_SETTING: The default value for the language setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LANGUAGE_SETTING);
 *
 * @returns {string} - The default value for the language setting
 */
export const DEFAULT_LANGUAGE_SETTING: string = 'javascript';

/**
 * DEFAULT_COMMENT_MESSAGE_WRAPPED_SETTING: The default value for the comment wrapped setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_COMMENT_MESSAGE_WRAPPED_SETTING);
 *
 * @returns {boolean} - The default value for the comment wrapped setting
 */
export const DEFAULT_COMMENT_MESSAGE_WRAPPED_SETTING: boolean = false;

/**
 * DEFAULT_COMMENT_MESSAGE_PREFIX: The default value for the comment prefix.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_COMMENT_MESSAGE_PREFIX);
 *
 * @returns {string} - The default value for the comment prefix
 */
export const DEFAULT_COMMENT_MESSAGE_PREFIX: string = '🔹';

/**
 * DEFAULT_MESSAGE_COMMENT_DELIMITER: The default value for the message comment delimiter.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_MESSAGE_COMMENT_DELIMITER);
 *
 * @returns {string} - The default value for the message comment delimiter
 */
export const DEFAULT_MESSAGE_COMMENT_DELIMITER: string = '~';

/**
 * DEFAULT_MESSAGE_COMMENT_SUFFIX: The default value for the message comment suffix.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_MESSAGE_COMMENT_SUFFIX);
 *
 * @returns {string} - The default value for the message comment suffix
 */
export const DEFAULT_MESSAGE_COMMENT_SUFFIX: string = ':';

/**
 * DEFAULT_ADD_EMPTY_LINE_BEFORE_COMMENT_MESSAGE_SETTING: The default value for the add empty line before comment setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_ADD_EMPTY_LINE_BEFORE_COMMENT_MESSAGE_SETTING);
 *
 * @returns {boolean} - The default value for the add empty line before comment setting
 */
export const DEFAULT_ADD_EMPTY_LINE_BEFORE_COMMENT_MESSAGE_SETTING: boolean = false;

/**
 * DEFAULT_ADD_EMPTY_LINE_AFTER_COMMENT_SETTING: The default value for the add empty line after comment setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_ADD_EMPTY_LINE_AFTER_COMMENT_SETTING);
 *
 * @returns {boolean} - The default value for the add empty line after comment setting
 */
export const DEFAULT_ADD_EMPTY_LINE_AFTER_COMMENT_SETTING: boolean = false;

/**
 * DEFAULT_LITERAL_OPEN_SETTING: The default value for the literal open setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LITERAL_OPEN_SETTING);
 *
 * @returns {string} - The default value for the literal open setting
 */
export const DEFAULT_LITERAL_OPEN_SETTING: string = '{';

/**
 * DEFAULT_LITERAL_CLOSE_SETTING: The default value for the literal close setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LITERAL_CLOSE_SETTING);
 *
 * @returns {string} - The default value for the literal close setting
 */
export const DEFAULT_LITERAL_CLOSE_SETTING: string = '}';

/**
 * DEFAULT_USE_CURRENT_POSITION_SETTING: The default value for the use current position setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_USE_CURRENT_POSITION_SETTING);
 *
 * @returns {boolean} - The default value for the use current position setting
 */
export const DEFAULT_USE_CURRENT_POSITION_SETTING: boolean = false;

/**
 * DEFAULT_AUTHOR_SETTING: The default value for the author setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_AUTHOR_SETTING);
 *
 * @returns {string} - The default value for the author setting
 */
export const DEFAULT_AUTHOR_SETTING: string = 'Unknown';

/**
 * DEFAULT_DATE_SETTING: The default value for the date setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_DATE_SETTING);
 *
 * @returns {string} - The default value for the date setting
 */
export const DEFAULT_VERSION_SETTING: string = '1.0.0';

/**
 * DEFAULT_LICENSE_SETTING: The default value for the license setting.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LICENSE_SETTING);
 *
 * @returns {string} - The default value for the license setting
 */
export const DEFAULT_LICENSE_SETTING: string = 'MIT';

/**
 * DEFAULT_HIGHLIGHT_ACTIVE_SETTING: The default value for the highlight active setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_HIGHLIGHT_ACTIVE_SETTING);
 *
 * @returns {boolean} - The default value for the highlight active setting
 */
export const DEFAULT_HIGHLIGHT_ACTIVE_SETTING: boolean = true;

/**
 * DEFAULT_HIGHLIGHT_RULES: The default value for the highlight rules setting.
 * @type {HighlightRule[]}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_HIGHLIGHT_RULES);
 *
 * @returns {HighlightRule[]} - The default value for the highlight rules setting
 */
export const DEFAULT_HIGHLIGHT_RULES: HighlightRule[] = [
  { 'keyword': 'TODO', 'color': 'rgba(255,204,0,0.3)', 'bold': true },
  {
    'keyword': 'FIXME',
    'color': 'rgba(255,0,0,0.3)',
    'bold': true,
    'underline': true,
  },
  { 'keyword': 'NOTE', 'color': 'rgba(0,255,0,0.3)', 'italic': true },
];

/**
 * DEFAULT_SPECIAL_HIGHLIGHT_DECORATION: The default value for the special highlight decoration setting.
 * @type {DecorationRenderOptions}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_SPECIAL_HIGHLIGHT_DECORATION);
 *
 * @returns {DecorationRenderOptions} - The default value for the special highlight decoration setting
 */
export const DEFAULT_SPECIAL_HIGHLIGHT_DECORATION: DecorationRenderOptions = {
  'backgroundColor': 'rgba(0,128,255,0.3)',
  'border': '1px solid blue',
  'isWholeLine': true,
};

/**
 * DEFAULT_CUSTOM_COMMENT_TEMPLATES: The default value for the custom comment templates setting.
 * @type {string[]}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_CUSTOM_COMMENT_TEMPLATES);
 *
 * @returns {string[]} - The default value for the custom comment templates setting
 */
export const DEFAULT_CUSTOM_COMMENT_TEMPLATES: CommentTemplate[] = [];

/**
 * DEFAULT_INCLUDED_FILE_PATTERNS: Default glob patterns for files to include.
 */
export const DEFAULT_INCLUDED_FILE_PATTERNS: string[] = ['**/*{js,ts,md}'];

/**
 * DEFAULT_EXCLUDED_FILE_PATTERNS: Default glob patterns for files to exclude.
 */
export const DEFAULT_EXCLUDED_FILE_PATTERNS: string[] = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
];

/**
 * DEFAULT_MAX_SEARCH_RECURSION_DEPTH: Default maximum recursion depth for file search.
 */
export const DEFAULT_MAX_SEARCH_RECURSION_DEPTH: number = 0;

/**
 * DEFAULT_SUPPORTS_HIDDEN_FILES: Default setting for including hidden files.
 */
export const DEFAULT_SUPPORTS_HIDDEN_FILES: boolean = false;

/**
 * DEFAULT_PRESERVE_GITIGNORE_SETTINGS: Default setting for respecting .gitignore.
 */
export const DEFAULT_PRESERVE_GITIGNORE_SETTINGS: boolean = true;

/**
 * DEFAULT_SHOW_FILE_PATH_IN_RESULTS: Default setting for showing file paths in results.
 */
export const DEFAULT_SHOW_FILE_PATH_IN_RESULTS: boolean = true;

/**
 * DEFAULT_NOTES_FOLDER: The default folder name for project notes.
 */
export const DEFAULT_NOTES_FOLDER: string = '.codemark';

/**
 * DEFAULT_CREATE_DEFAULT_FILES_SETTING: Whether to create default notes files automatically.
 */
export const DEFAULT_CREATE_DEFAULT_FILES_SETTING: boolean = true;

/**
 * DEFAULT_TODO_FILE_NAME: Default filename for project TODO list.
 */
export const DEFAULT_TODO_FILE_NAME: string = '(TODO).md';

/**
 * DEFAULT_SCRATCHPAD_FILE_NAME: Default filename for project scratchpad.
 */
export const DEFAULT_SCRATCHPAD_FILE_NAME: string = '(Scratchpad).md';

/**
 * DEFAULT_EXCLUDE_GLOBS: Default glob patterns to exclude from indexing.
 */
export const DEFAULT_EXCLUDE_GLOBS: string[] = [
  '**/node_modules/**',
  '**/.git/**',
];

/**
 * DEFAULT_TAG_PROFILES: Default tag profiles mapping.
 */
export const DEFAULT_TAG_PROFILES: Record<
  string,
  { priority: number; icon?: string; color?: string }
> = {};

/**
 * DEFAULT_MAX_FILES_TO_INDEX: Default maximum number of files to index.
 */
export const DEFAULT_MAX_FILES_TO_INDEX: number = 1000;

/**
 * DEFAULT_CONCURRENCY_LIMIT: Default maximum number of files to process concurrently during indexing.
 */
export const DEFAULT_CONCURRENCY_LIMIT: number = 10;

/**
 * DEFAULT_BATCH_SIZE: Default number of files to process in each batch during indexing.
 */
export const DEFAULT_BATCH_SIZE: number = 10;

/**
 * TAG_BROWSER_MAX_FILE_SIZE_BYTES: Internal cap to skip scanning very large files.
 * Not user-configurable; chosen conservatively to protect responsiveness.
 */
export const TAG_BROWSER_MAX_FILE_SIZE_BYTES: number = 1 * 1024 * 1024; // 1MB

/**
 * TAG_BROWSER_MAX_OCCURRENCES_PER_FILE: Internal cap to limit total matches collected per file.
 * Not user-configurable; prevents UI lag from extremely repetitive content.
 */
export const TAG_BROWSER_MAX_OCCURRENCES_PER_FILE: number = 150;

/**
 * TAG_BROWSER_MAX_ENTRIES_PER_TAG: Internal cap to limit number of entries per tag across the whole tree build.
 */
export const TAG_BROWSER_MAX_ENTRIES_PER_TAG: number = 300;

/**
 * TAG_BROWSER_MAX_TOTAL_ENTRIES: Internal cap to limit total entries across the whole tree build.
 */
export const TAG_BROWSER_MAX_TOTAL_ENTRIES: number = 2000;
