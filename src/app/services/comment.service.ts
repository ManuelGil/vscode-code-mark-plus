import * as mustache from 'mustache';
import { ExtensionConfig } from '../configs';
import { CommentData } from '../types';

/**
 * The CommentService class.
 *
 * @class
 * @classdesc The class that represents the comment service.
 * @export
 * @public
 * @example
 * const commentService = new CommentService(config);
 */
export class CommentService {
  // -----------------------------------------------------------------
  // Properties
  // -----------------------------------------------------------------

  // Private properties

  /**
   * The default single line comment strings for each language.
   *
   * @private
   * @type {Record<string, string>}
   * @memberof CommentController
   * @example
   * this.defaultSingleLineComment
   */
  private readonly defaultSingleLineComment: Record<string, string> = {
    javascript: '//',
    typescript: '//',
    java: '//',
    csharp: '//',
    php: '//',
    dart: '//',
    python: '#',
    cpp: '//',
    ruby: '#',
    go: '//',
    kotlin: '//',
    swift: '//',
    scala: '//',
    lua: '--',
    perl: '#',
    elixir: '#',
    haskell: '--',
  };

  /**
   * The default templates for the comment snippets.
   *
   * @private
   * @type {Array<{ language: string; template: string }>}
   * @memberof CommentController
   * @example
   * this.defaultTemplates;
   */
  private readonly defaultTemplates: Array<{
    language: string;
    template: string[];
  }> = [
    {
      language: 'javascript',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @returns {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'typescript',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @returns {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'java',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @method {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'csharp',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @method {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'php',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'dart',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'python',
      template: [
        '{{indent}}"""',
        '{{indent}}the {{{functionName}}} method',
        '{{indent}}',
        '{{indent}}@function {{{functionName}}}',
        '{{indent}}@signature {{{signature}}}',
        '{{indent}}@modifiers {{{modifiers}}}',
        '{{indent}}',
        '{{indent}}@params:',
        '{{#parameters}}{{indent}}  - {{{.}}}{{/parameters}}',
        '{{indent}}@return {Type} - {{{returnType}}}',
        '{{indent}}',
        '{{indent}}@file {{{fileName}}}',
        '{{indent}}@date {{{date}}}',
        '{{indent}}@author {{{author}}}',
        '{{indent}}@version {{{version}}}',
        '{{indent}}@license {{{license}}}',
        '{{indent}}"""\n',
      ],
    },
    {
      language: 'cpp',
      template: [
        '{{indent}}/**',
        '{{indent}} * @brief the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'ruby',
      template: [
        '{{indent}}#',
        '{{indent}}# the {{{functionName}}} method',
        '{{indent}}#',
        '{{indent}}# @function {{{functionName}}}',
        '{{indent}}# @signature {{{signature}}}',
        '{{indent}}# @modifiers {{{modifiers}}}',
        '{{indent}}#',
        '{{indent}}# @params:',
        '{{#parameters}}{{indent}}#   - {{{.}}}{{/parameters}}',
        '{{indent}}# @return {Type} - {{{returnType}}}',
        '{{indent}}#',
        '{{indent}}# @file {{{fileName}}}',
        '{{indent}}# @date {{{date}}}',
        '{{indent}}# @author {{{author}}}',
        '{{indent}}# @version {{{version}}}',
        '{{indent}}# @license {{{license}}}',
        '{{indent}}#\n',
      ],
    },
    {
      language: 'go',
      template: [
        '{{indent}}//',
        '{{indent}}// the {{{functionName}}} method',
        '{{indent}}//',
        '{{indent}}// @function {{{functionName}}}',
        '{{indent}}// @signature {{{signature}}}',
        '{{indent}}// @modifiers {{{modifiers}}}',
        '{{indent}}//',
        '{{indent}}// @params:',
        '{{#parameters}}{{indent}}//   - {{{.}}}{{/parameters}}',
        '{{indent}}// @return {Type} - {{{returnType}}}',
        '{{indent}}//',
        '{{indent}}// @file {{{fileName}}}',
        '{{indent}}// @date {{{date}}}',
        '{{indent}}// @author {{{author}}}',
        '{{indent}}// @version {{{version}}}',
        '{{indent}}// @license {{{license}}}',
        '{{indent}}//\n',
      ],
    },
    {
      language: 'kotlin',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'swift',
      template: [
        '{{indent}}///',
        '{{indent}}/// the {{{functionName}}} method',
        '{{indent}}///',
        '{{indent}}/// @function {{{functionName}}}',
        '{{indent}}/// @signature {{{signature}}}',
        '{{indent}}/// @modifiers {{{modifiers}}}',
        '{{indent}}///',
        '{{indent}}/// @params:',
        '{{#parameters}}{{indent}}///   - {{{.}}}{{/parameters}}',
        '{{indent}}/// @return {Type} - {{{returnType}}}',
        '{{indent}}///',
        '{{indent}}/// @file {{{fileName}}}',
        '{{indent}}/// @date {{{date}}}',
        '{{indent}}/// @author {{{author}}}',
        '{{indent}}/// @version {{{version}}}',
        '{{indent}}/// @license {{{license}}}',
        '{{indent}}///\n',
      ],
    },
    {
      language: 'scala',
      template: [
        '{{indent}}/**',
        '{{indent}} * @description the {{{functionName}}} method',
        '{{indent}} *',
        '{{indent}} * @function {{{functionName}}}',
        '{{indent}} * @signature {{{signature}}}',
        '{{indent}} * @modifiers {{{modifiers}}}',
        '{{indent}} *',
        '{{indent}} * @params:',
        '{{#parameters}}{{indent}} *   - {{{.}}}{{/parameters}}',
        '{{indent}} * @return {Type} - {{{returnType}}}',
        '{{indent}} *',
        '{{indent}} * @file {{{fileName}}}',
        '{{indent}} * @date {{{date}}}',
        '{{indent}} * @author {{{author}}}',
        '{{indent}} * @version {{{version}}}',
        '{{indent}} * @license {{{license}}}',
        '{{indent}} */\n',
      ],
    },
    {
      language: 'lua',
      template: [
        '{{indent}}--[[',
        '{{indent}}the {{{functionName}}} method',
        '{{indent}}',
        '{{indent}}@function {{{functionName}}}',
        '{{indent}}@signature {{{signature}}}',
        '{{indent}}@modifiers {{{modifiers}}}',
        '{{indent}}',
        '{{indent}}@params:',
        '{{#parameters}}{{indent}}  - {{{.}}}{{/parameters}}',
        '{{indent}}@return {Type} - {{{returnType}}}',
        '{{indent}}',
        '{{indent}}@file {{{fileName}}}',
        '{{indent}}@date {{{date}}}',
        '{{indent}}@author {{{author}}}',
        '{{indent}}@version {{{version}}}',
        '{{indent}}@license {{{license}}}',
        '{{indent}}--]]\n',
      ],
    },
    {
      language: 'perl',
      template: [
        '{{indent}}#',
        '{{indent}}# the {{{functionName}}} method',
        '{{indent}}#',
        '{{indent}}# @function {{{functionName}}}',
        '{{indent}}# @signature {{{signature}}}',
        '{{indent}}# @modifiers {{{modifiers}}}',
        '{{indent}}#',
        '{{indent}}# @params:',
        '{{#parameters}}{{indent}}#   - {{{.}}}{{/parameters}}',
        '{{indent}}# @return {Type} - {{{returnType}}}',
        '{{indent}}#',
        '{{indent}}# @file {{{fileName}}}',
        '{{indent}}# @date {{{date}}}',
        '{{indent}}# @author {{{author}}}',
        '{{indent}}# @version {{{version}}}',
        '{{indent}}# @license {{{license}}}',
        '{{indent}}#\n',
      ],
    },
    {
      language: 'elixir',
      template: [
        '{{indent}}#',
        '{{indent}}# the {{{functionName}}} method',
        '{{indent}}#',
        '{{indent}}# @function {{{functionName}}}',
        '{{indent}}# @signature {{{signature}}}',
        '{{indent}}# @modifiers {{{modifiers}}}',
        '{{indent}}#',
        '{{indent}}# @params:',
        '{{#parameters}}{{indent}}#   - {{{.}}}{{/parameters}}',
        '{{indent}}# @return {Type} - {{{returnType}}}',
        '{{indent}}#',
        '{{indent}}# @file {{{fileName}}}',
        '{{indent}}# @date {{{date}}}',
        '{{indent}}# @author {{{author}}}',
        '{{indent}}# @version {{{version}}}',
        '{{indent}}# @license {{{license}}}',
        '{{indent}}#\n',
      ],
    },
    {
      language: 'haskell',
      template: [
        '{{indent}}--',
        '{{indent}}-- the {{{functionName}}} method',
        '{{indent}}--',
        '{{indent}}-- @function {{{functionName}}}',
        '{{indent}}-- @signature {{{signature}}}',
        '{{indent}}-- @modifiers {{{modifiers}}}',
        '{{indent}}--',
        '{{indent}}-- @params:',
        '{{#parameters}}{{indent}}--   - {{{.}}}{{/parameters}}',
        '{{indent}}-- @return {Type} - {{{returnType}}}',
        '{{indent}}--',
        '{{indent}}-- @file {{{fileName}}}',
        '{{indent}}-- @date {{{date}}}',
        '{{indent}}-- @author {{{author}}}',
        '{{indent}}-- @version {{{version}}}',
        '{{indent}}-- @license {{{license}}}',
        '{{indent}}--\n',
      ],
    },
  ];

  // -----------------------------------------------------------------
  // Constructor
  // -----------------------------------------------------------------

  /**
   * Constructor for the CommentService class
   *
   * @constructor
   * @param {ExtensionConfig} config - The configuration object
   * @public
   * @memberof CommentService
   * @example
   * this.commentService = new CommentService(config);
   *
   * @returns {CommentService} - The comment service
   */
  constructor(readonly config: ExtensionConfig) {}

  // -----------------------------------------------------------------
  // Methods
  // -----------------------------------------------------------------

  // Public methods

  /**
   * The generateCommentSnippet method.
   * Generate a comment snippet for the specified file.
   * @function generateCommentSnippet
   * @public
   * @memberof CommentService
   * @example
   * this.commentService.generateCommentSnippet(indent, fileName, variableName);
   *
   * @param {CommentData} data - The comment data
   *
   * @returns {string} - The comment snippet
   */
  generateCommentSnippet(data: CommentData): string {
    const {
      defaultLanguage,
      customTemplates,
      isCommentMessageWrapped,
      addEmptyLineBeforeComment,
      addEmptyLineAfterComment,
    } = this.config;

    const languageId = data.languageId || '';
    const supportedLanguages = [
      'javascript',
      'typescript',
      'java',
      'csharp',
      'php',
      'dart',
      'python',
      'cpp',
      'ruby',
      'go',
      'kotlin',
      'swift',
      'scala',
      'lua',
      'perl',
      'elixir',
      'haskell',
    ];

    const language = supportedLanguages.includes(languageId)
      ? languageId
      : defaultLanguage;

    const customTemplate = customTemplates.find(
      (template) => template.language === language,
    );

    const defaultTemplate = this.defaultTemplates.find(
      (template) => template.language === language,
    );

    const singleLineComment =
      this.defaultSingleLineComment[
        language as keyof typeof this.defaultSingleLineComment
      ];

    let content: string | undefined =
      customTemplate?.template?.join('\n') ||
      defaultTemplate?.template?.join('\n');

    if (!content) {
      return `${data.indent}${singleLineComment} The ${data.functionName} method`;
    }

    if (!content.endsWith('\n')) {
      content += '\n';
    }

    content = this.wrapContent(
      content,
      data.indent,
      singleLineComment,
      isCommentMessageWrapped,
      addEmptyLineBeforeComment,
      addEmptyLineAfterComment,
    );

    return mustache.render(content, data);
  }

  /**
   * The findSingleLineComments method.
   * Find the single line comments in the specified code.
   * @function findSingleLineComments
   * @public
   * @memberof CommentService
   * @example
   * this.commentService.findSingleLineComments(code);
   *
   * @param {string} code - The code to search for single line comments
   *
   * @returns {Array<{
   *   start: number;
   *   end: number;
   *   line: number;
   *   preview: string;
   *   fullText: string;
   * }>} - The array of single line comments
   */
  findSingleLineComments(code: string): Array<{
    start: number;
    end: number;
    line: number;
    preview: string;
    fullText: string;
  }> {
    // Por defecto se asume el lenguaje; este método podría ampliarse para usar la configuración.
    const marker = this.defaultSingleLineComment['javascript'] || '//';
    const escapedMarker = marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const markerPattern = new RegExp(`${escapedMarker}.*$`, 'gm');

    const commentRanges: Array<{
      start: number;
      end: number;
      line: number;
      preview: string;
      fullText: string;
    }> = [];

    let match: RegExpExecArray | null;
    while ((match = markerPattern.exec(code)) !== null) {
      const start = match.index;
      const newlineIndex = code.indexOf('\n', start);
      const end = newlineIndex === -1 ? code.length : newlineIndex;
      const line = code.slice(0, start).split('\n').length;
      const preview =
        code
          .slice(start, start + 20)
          .replace(/\n/g, '')
          .trim() + '... ';
      const fullText = code.slice(start, end).trim();
      commentRanges.push({ start, end, line, preview, fullText });
    }
    return commentRanges;
  }

  // Private methods

  /**
   * The wrapContent method.
   * Wrap the content with the specified settings.
   * @function wrapContent
   * @private
   * @memberof CommentService
   * @example
   * this.wrapContent(content, indent, singleLineComment, isWrapped, addEmptyBefore, addEmptyAfter);
   *
   * @param {string} content - The content to wrap
   * @param {string} indent - The indentation string
   * @param {string} singleLineComment - The single line comment string
   * @param {boolean} isWrapped - The flag to indicate if the content should be wrapped
   * @param {boolean} addEmptyBefore - The flag to indicate if an empty line should be added before the content
   * @param {boolean} addEmptyAfter - The flag to indicate if an empty line should be added after the content
   *
   * @returns {string} - The wrapped content
   */
  private wrapContent(
    content: string,
    indent: string,
    singleLineComment: string,
    isWrapped: boolean,
    addEmptyBefore: boolean,
    addEmptyAfter: boolean,
  ): string {
    if (isWrapped) {
      const border = `${indent}${singleLineComment} -----------------------------------------------------------------`;
      content = `${border}\n${content}\n${border}`;
    }

    if (addEmptyBefore) {
      content = `\n${content}`;
    }

    if (addEmptyAfter) {
      content = `${content}\n`;
    }

    return content;
  }
}
