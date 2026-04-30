import { HighlightRule } from '../types';

/**
 * Collect human-readable warnings for potentially invalid or confusing
 * highlight rule combinations configured by the user. This function is
 * free of VS Code APIs and safe for unit testing.
 *
 * The function analyzes the raw rules as provided in settings and reports:
 * - Rules ignored due to missing color or missing keyword/pattern
 * - Regex mode without a pattern (keyword will be treated literally)
 * - wholeWord used with regex mode (ignored)
 * - Both keyword and pattern provided (potential ambiguity)
 * - Duplicate effective rules for the same key/language/case sensitivity
 *
 * Note: Consumers should continue using `getNormalizedHighlightRules(config)`
 * for actual rule usage. This helper is only for diagnostics shown to users.
 *
 * @param {HighlightingConfigSource} config Read-only source exposing highlight rules.
 * @returns {string[]} List of warning messages.
 */
type HighlightingConfigSource = Readonly<{
  highlighting: Readonly<{
    highlightRules: ReadonlyArray<HighlightRule>;
  }>;
}>;

export function collectHighlightRuleWarnings(
  config: HighlightingConfigSource,
): string[] {
  const raw = Array.isArray(config.highlighting.highlightRules)
    ? (config.highlighting.highlightRules as HighlightRule[])
    : [];
  const warnings: string[] = [];

  const makeSig = (rule: HighlightRule, index: number): string => {
    const key: string = String(rule.keyword ?? rule.pattern ?? `#${index + 1}`);
    const mode: string = String(
      rule.matchMode ?? (rule.pattern ? 'regex' : 'word'),
    );
    const caseKey: string = String(rule.caseSensitive ?? true);
    const langs: unknown = (rule as unknown as { languageIds?: unknown })
      .languageIds;
    const langArr: string[] = Array.isArray(langs)
      ? (langs as string[]).slice().sort()
      : typeof langs === 'string'
        ? [langs]
        : ['*'];
    return [key, mode, caseKey, langArr.join(',')].join('|');
  };

  const seen: Map<string, number> = new Map();
  const firstBySig: Map<string, { key: string; langs: string }> = new Map();

  raw.forEach((rule: HighlightRule | undefined, index: number) => {
    if (!rule) {
      warnings.push(`Rule #${index + 1} is null/undefined and was ignored.`);
      return;
    }

    const hasColor: boolean = Boolean(rule.color);
    const hasKeyOrPattern: boolean = Boolean(rule.keyword || rule.pattern);

    if (!hasColor) {
      warnings.push(`Rule #${index + 1} has no color and was ignored.`);
    }
    if (!hasKeyOrPattern) {
      warnings.push(
        `Rule #${index + 1} has neither keyword nor pattern and was ignored.`,
      );
    }

    if (rule.matchMode === 'regex' && !rule.pattern && rule.keyword) {
      warnings.push(
        `Rule #${index + 1} uses matchMode=regex without a pattern; keyword will be treated literally.`,
      );
    }

    if (rule.matchMode === 'regex' && rule.wholeWord === true) {
      warnings.push(
        `Rule #${index + 1} sets wholeWord=true with matchMode=regex; wholeWord has no effect in regex mode.`,
      );
    }

    if (rule.matchMode === 'substring' && rule.wholeWord === true) {
      warnings.push(
        `Rule #${index + 1} sets wholeWord=true with matchMode=substring; wholeWord has no effect in substring mode.`,
      );
    }

    if (rule.keyword && rule.pattern) {
      warnings.push(
        `Rule #${index + 1} provides both keyword and pattern; behavior depends on matchMode and may be ambiguous.`,
      );
    }

    if (rule.pattern && rule.matchMode && rule.matchMode !== 'regex') {
      warnings.push(
        `Rule #${index + 1} provides a 'pattern' but 'matchMode' is '${rule.matchMode}'. The pattern will be ignored.`,
      );
    }

    // languageIds shape warning
    const langs: unknown = (rule as unknown as { languageIds?: unknown })
      .languageIds;
    if (typeof langs === 'string') {
      warnings.push(
        `Rule #${index + 1} sets languageIds as a string; it will be coerced to an array.`,
      );
    }

    // duplicate detection signature
    if (hasColor && hasKeyOrPattern) {
      const sig: string = makeSig(rule, index);
      const keyVal: string = String(
        rule.keyword ?? rule.pattern ?? `#${index + 1}`,
      );
      const langKey: string = Array.isArray(langs)
        ? (langs as string[]).slice().sort().join(',')
        : typeof langs === 'string'
          ? langs
          : '*';

      if (!firstBySig.has(sig)) {
        firstBySig.set(sig, { key: keyVal, langs: langKey });
      }
      seen.set(sig, (seen.get(sig) ?? 0) + 1);
    }
  });

  // Add duplicate warnings
  for (const [sig, count] of seen.entries()) {
    if (count > 1) {
      const meta = firstBySig.get(sig);
      const label: string = meta ? `${meta.key} [langs: ${meta.langs}]` : sig;
      warnings.push(
        `${count} duplicate rules detected for ${label}; higher priority rules will take precedence.`,
      );
    }
  }

  return warnings;
}
