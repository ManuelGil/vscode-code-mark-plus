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
export const EXTENSION_DISPLAY_NAME: string = 'codeMark+';

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
 * DEFAULT_LOG_MESSAGE_WRAPPED_SETTING: The default value for the comment wrapped setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LOG_MESSAGE_WRAPPED_SETTING);
 *
 * @returns {boolean} - The default value for the comment wrapped setting
 */
export const DEFAULT_LOG_MESSAGE_WRAPPED_SETTING: boolean = false;

/**
 * DEFAULT_LOG_MESSAGE_PREFIX: The default value for the comment prefix.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_LOG_MESSAGE_PREFIX);
 *
 * @returns {string} - The default value for the comment prefix
 */
export const DEFAULT_LOG_MESSAGE_PREFIX: string = '🔹';

/**
 * DEFAULT_MESSAGE_LOG_DELIMITER: The default value for the message log delimiter.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_MESSAGE_LOG_DELIMITER);
 *
 * @returns {string} - The default value for the message log delimiter
 */
export const DEFAULT_MESSAGE_LOG_DELIMITER: string = '~';

/**
 * DEFAULT_MESSAGE_LOG_SUFFIX: The default value for the message log suffix.
 * @type {string}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_MESSAGE_LOG_SUFFIX);
 *
 * @returns {string} - The default value for the message log suffix
 */
export const DEFAULT_MESSAGE_LOG_SUFFIX: string = ':';

/**
 * DEFAULT_ADD_EMPTY_LINE_BEFORE_LOG_MESSAGE_SETTING: The default value for the add empty line before comment setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_ADD_EMPTY_LINE_BEFORE_LOG_MESSAGE_SETTING);
 *
 * @returns {boolean} - The default value for the add empty line before comment setting
 */
export const DEFAULT_ADD_EMPTY_LINE_BEFORE_LOG_MESSAGE_SETTING: boolean = false;

/**
 * DEFAULT_ADD_EMPTY_LINE_AFTER_LOG_SETTING: The default value for the add empty line after log setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_ADD_EMPTY_LINE_AFTER_LOG_SETTING);
 *
 * @returns {boolean} - The default value for the add empty line after log setting
 */
export const DEFAULT_ADD_EMPTY_LINE_AFTER_LOG_SETTING: boolean = false;

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
 * DEFAULT_USE_CURRENT_INDENT_SETTING: The default value for the use current indent setting.
 * @type {boolean}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_USE_CURRENT_INDENT_SETTING);
 *
 * @returns {boolean} - The default value for the use current indent setting
 */
export const DEFAULT_USE_CURRENT_INDENT_SETTING: boolean = false;

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
 * @type {HighlightRule}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_SPECIAL_HIGHLIGHT_DECORATION);
 *
 * @returns {HighlightRule} - The default value for the special highlight decoration setting
 */
export const DEFAULT_SPECIAL_HIGHLIGHT_DECORATION: Object = {
  'backgroundColor': 'rgba(0,128,255,0.3)',
  'border': '1px solid blue',
  'isWholeLine': true,
};

/**
 * DEFAULT_CUSTOM_LOG_TEMPLATES: The default value for the custom log templates setting.
 * @type {string[]}
 * @public
 * @memberof Constants
 * @example
 * console.log(DEFAULT_CUSTOM_LOG_TEMPLATES);
 *
 * @returns {string[]} - The default value for the custom log templates setting
 */
export const DEFAULT_CUSTOM_LOG_TEMPLATES: CommentTemplate[] = [];
