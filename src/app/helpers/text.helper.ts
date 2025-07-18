/**
 * Escapes a string to be safely used in a regular expression.
 * This improved implementation ensures all special regex characters are properly escaped.
 *
 * @function escapeRegExp
 * @private
 * @memberof HighlightController
 * @example
 * const escaped = escapeRegExp(input);
 *
 * @param {string} input - The string to escape
 *
 * @returns {string} - The escaped string
 */
export const escapeRegExp = (input: string): string => {
  // If input is undefined or null, return an empty string
  if (input === undefined || input === null) {
    return '';
  }

  // Convert input to string in case it's not already
  const str = String(input);

  // Escape all regex special characters
  return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
};
