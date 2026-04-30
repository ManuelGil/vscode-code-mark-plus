/**
 * TagData interface
 * @description Interface for tag data.
 * @export
 * @interface TagData
 * @example
 * export interface TagData {
 * }
 *
 * @param {string} tag The tag name (e.g., "TODO", "FIXME").
 * @param {string} content The content or description associated with the tag.
 * @param {string} filePath The file path where the tag was found.
 * @param {number} line The line number where the tag was found.
 * @param {number} character The character position where the tag was found.
 * @param {number} priority Optional priority of the tag (can be used for sorting).
 * @param {Date} timestamp Optional timestamp when the tag was created/updated.
 * @param {string} author Optional author of the tag.
 *
 * @returns {TagData} The tag data interface.
 */
export interface TagData {
  tag: string;
  content: string;
  filePath: string;
  line: number;
  character: number;
  priority?: number;
  timestamp?: Date;
  author?: string;
}

/**
 * TagProfile interface
 * @description Interface for tag profiles configuration.
 * @export
 * @interface TagProfile
 * @example
 * export interface TagProfile {
 * }
 *
 * @param {string} name The profile name.
 * @param {string[]} tags List of tags included in this profile.
 * @param {boolean} isDefault Whether this profile is the default one.
 *
 * @returns {TagProfile} The tag profile interface.
 */
export interface TagProfile {
  name: string;
  tags: string[];
  isDefault?: boolean;
}

/**
 * TagIndex interface
 * @description Interface for the tag index.
 * @export
 * @interface TagIndex
 * @example
 * export interface TagIndex {
 * }
 *
 * @param {Record<string, TagData[]>} tags A record of tag names to their occurrences.
 * @param {Date} lastIndexed Timestamp of the last indexing operation.
 *
 * @returns {TagIndex} The tag index interface.
 */
export interface TagIndex {
  tags: Record<string, TagData[]>;
  lastIndexed: Date;
}
