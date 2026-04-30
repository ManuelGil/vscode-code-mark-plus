/**
 * Note interface
 * @description Interface for project notes.
 * @export
 * @interface Note
 * @example
 * export interface Note {
 * }
 *
 * @param {string} title The title of the note.
 * @param {string} content The content of the note.
 * @param {string} filePath The file path where the note is stored.
 * @param {Date} createdAt Date when the note was created.
 * @param {Date} updatedAt Date when the note was last updated.
 * @param {string[]} tags Optional tags associated with the note.
 *
 * @returns {Note} The note interface.
 */
export interface Note {
  title: string;
  content: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

/**
 * NoteLink interface
 * @description Interface for links between notes and code.
 * @export
 * @interface NoteLink
 * @example
 * export interface NoteLink {
 * }
 *
 * @param {string} notePath The path to the note file.
 * @param {string} noteTitle The title of the note.
 * @param {string} targetFilePath Optional path to the target file.
 * @param {number} targetLine Optional line number in the target file.
 *
 * @returns {NoteLink} The note link interface.
 */
export interface NoteLink {
  notePath: string;
  noteTitle: string;
  targetFilePath?: string;
  targetLine?: number;
}
