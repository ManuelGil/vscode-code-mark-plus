import { ExtensionConfig } from '../configs';
import { HighlightRule } from '../types';

/**
 * Normalize and validate highlight rules while preserving backward compatibility.
 *
 * Rules are filtered to only include entries with a background color and either a
 * keyword or a pattern. Defaults are applied to maintain legacy behavior unless
 * explicitly overridden by user settings.
 *
 * Defaults applied:
 * - matchMode: 'regex' if pattern is provided; otherwise 'word'
 * - caseSensitive: true (legacy behavior)
 * - wholeWord: true (legacy behavior)
 * - priority: 0
 * - languageIds: coerced to array if provided as a single string
 *
 * NOTE: This helper is intentionally free of VS Code APIs to keep it unit-test friendly
 * and to maintain a clear separation from configuration retrieval.
 *
 * @param {HighlightRule[]} rules - The raw rules loaded from configuration.
 * @returns {HighlightRule[]} A new array of normalized rules.
 */
export function normalizeHighlightRules(
  rules: HighlightRule[],
): HighlightRule[] {
  if (!Array.isArray(rules)) {
    return [];
  }

  return rules
    .filter((rule) => {
      if (!rule) {
        return false;
      }
      if (!rule.color) {
        return false;
      }
      return Boolean(rule.keyword || rule.pattern);
    })
    .map((rule) => {
      const normalized: HighlightRule = { ...rule };

      if (!normalized.matchMode) {
        normalized.matchMode = normalized.pattern ? 'regex' : 'word';
      }

      if (normalized.caseSensitive === undefined) {
        normalized.caseSensitive = true;
      }

      if (normalized.wholeWord === undefined) {
        normalized.wholeWord = true;
      }

      if (normalized.priority === undefined) {
        normalized.priority = 0;
      }

      if (normalized.languageIds && !Array.isArray(normalized.languageIds)) {
        normalized.languageIds = [String(normalized.languageIds)];
      }

      return normalized;
    });
}

/**
 * Provide normalized highlight rules from the given ExtensionConfig instance.
 * This inverts the dependency direction so consumers can use normalized rules
 * without ExtensionConfig importing this helper.
 *
 * @param {ExtensionConfig} config - The extension configuration instance.
 * @returns {HighlightRule[]} Normalized highlight rules.
 */
export function getNormalizedHighlightRules(
  config: ExtensionConfig,
): HighlightRule[] {
  const highlightingConfig = config.highlighting;
  const rawRules = Array.isArray(highlightingConfig.highlightRules)
    ? (highlightingConfig.highlightRules as HighlightRule[])
    : [];
  return normalizeHighlightRules(rawRules);
}
