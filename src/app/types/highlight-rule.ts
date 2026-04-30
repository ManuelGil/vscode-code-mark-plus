/**
 * A single highlight rule describing how to match and style text.
 *
 * Normalization (see `normalizeHighlightRules()` in `helpers/highlight-rules.helper.ts`):
 * - If `matchMode` is not provided: defaults to `'regex'` when `pattern` exists; otherwise `'word'`.
 * - If `caseSensitive` is `undefined`: defaults to `true` (legacy behavior).
 * - If `wholeWord` is `undefined`: defaults to `true` (legacy behavior). Applies only to `'word'` mode; ignored in `'substring'` and `'regex'` modes.
 * - If `priority` is `undefined`: defaults to `0`.
 * - If `languageIds` is a single string, it is coerced to a string array.
 *
 * Examples:
 *
 * Before (legacy minimal word match):
 * ```ts
 * { keyword: 'TODO', color: 'rgba(255,204,0,0.3)', bold: true }
 * ```
 * After normalization:
 * ```ts
 * {
 *   keyword: 'TODO', color: 'rgba(255,204,0,0.3)', bold: true,
 *   matchMode: 'word', caseSensitive: true, wholeWord: true, priority: 0
 * }
 * ```
 *
 * Before (regex pattern):
 * ```ts
 * { pattern: '(?:(?<![A-Z])BUG|FIXME)', color: 'rgba(255,0,0,0.3)' }
 * ```
 * After normalization:
 * ```ts
 * {
 *   pattern: '(?:(?<![A-Z])BUG|FIXME)', color: 'rgba(255,0,0,0.3)',
 *   matchMode: 'regex', caseSensitive: true, wholeWord: true, priority: 0
 * }
 * ```
 */
export interface HighlightRule {
  keyword?: string;
  color: string;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
  /**
   * Controls how the rule matches text in the document.
   * - `word`: Literal keyword bounded by word boundaries. Respects `caseSensitive` and `wholeWord`.
   * - `substring`: Literal keyword anywhere within words. Ignores `wholeWord`.
   * - `regex`: ECMAScript regular expression via `pattern` or `keyword` as the source. Ignores `wholeWord`.
   * Defaults to `'regex'` when `pattern` is provided; otherwise `'word'`.
   */
  matchMode?: 'word' | 'substring' | 'regex';
  pattern?: string;
  caseSensitive?: boolean;
  /**
   * When `true`, only full words are matched in `word` mode.
   * This setting is ignored in `substring` and `regex` modes.
   */
  wholeWord?: boolean;
  /**
   * Optional list of VS Code language IDs where this rule applies.
   * When omitted, the rule applies to all languages.
   */
  languageIds?: string[];
  strikethrough?: boolean;
  /**
   * Higher values win when decoration ranges overlap; ties fall back to application order.
   * Default is `0`.
   */
  priority?: number;
}
