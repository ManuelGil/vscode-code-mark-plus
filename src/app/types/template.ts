/**
 * CommentTemplate interface
 * @description Interface for the comment template.
 * @export
 * @interface CommentTemplate
 * @example
 * export interface CommentTemplate {
 * }
 *
 * @param {string} language The language of the template.
 * @param {string} template The template for the comment.
 *
 * @returns {CommentTemplate} The comment template interface.
 */
export interface CommentTemplate {
  language: string;
  template: string[];
}
