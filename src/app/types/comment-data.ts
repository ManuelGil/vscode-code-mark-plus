/**
 * CommentData interface
 * @description Interface for the comment data.
 * @export
 * @interface CommentData
 * @example
 * export interface CommentData {
 * }
 *
 * @param {string} indent The indent for the comment.
 * @param {string} fileName The file name for the comment.
 * @param {string} functionName The function name for the comment.
 * @param {string} signature The signature for the comment.
 * @param {string} modifiers The modifiers for the comment.
 * @param {string} parameters The parameters for the comment.
 * @param {string} returnType The return type for the comment.
 * @param {string} author The author for the comment.
 * @param {string} date The date for the comment.
 * @param {string} commentMessagePrefix The comment message prefix.
 * @param {string} commentMessageSuffix The comment message suffix.
 * @param {string} commentDelimiter The comment delimiter.
 * @param {string} literalOpen The literal open.
 * @param {string} literalClose The literal close.
 *
 * @returns {CommentData} The comment data interface.
 */
export interface CommentData {
  indent: string;
  languageId: string;
  fileName: string;
  functionName: string;
  signature: string;
  modifiers: string;
  parameters: string;
  returnType: string;
  date: string;
  author: string;
  version: string;
  license: string;
  commentMessagePrefix: string;
  commentMessageSuffix: string;
  commentDelimiter: string;
  literalOpen: string;
  literalClose: string;
}
