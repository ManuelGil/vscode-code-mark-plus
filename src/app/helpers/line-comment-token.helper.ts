/**
 * Single-line comment tokens keyed by VS Code `TextDocument.languageId`.
 * Unknown identifiers fall back to `//` (legacy default).
 */
const LINE_COMMENT_TOKEN_BY_LANGUAGE_ID: Record<string, string> = {
  // JavaScript / TypeScript family
  javascript: '//',
  typescript: '//',
  javascriptreact: '//',
  typescriptreact: '//',
  jsx: '//',
  tsx: '//',
  vue: '//',
  svelte: '//',
  astro: '//',

  // C-style `//`
  java: '//',
  csharp: '//',
  cpp: '//',
  'cuda-cpp': '//',
  objectivecpp: '//',
  php: '//',
  dart: '//',
  go: '//',
  kotlin: '//',
  swift: '//',
  scala: '//',
  rust: '//',
  zig: '//',
  groovy: '//',

  // Hash `#`
  python: '#',
  shellscript: '#',
  bash: '#',
  sh: '#',
  zsh: '#',
  fish: '#',
  powershell: '#',
  dockerfile: '#',
  ruby: '#',
  perl: '#',
  raku: '#',
  elixir: '#',
  crystal: '#',
  julia: '#',
  r: '#',
  makefile: '#',
  cmake: '#',
  yaml: '#',
  yml: '#',

  // SQL-style `--`
  sql: '--',
  plsql: '--',
  mysql: '--',
  pgsql: '--',
  postgres: '--',

  // Double-dash (other)
  lua: '--',
  haskell: '--',
  purescript: '--',
  fsharp: '//',

  // Erlang / Prolog family
  erlang: '%',
  prolog: '%',
};

/**
 * Returns the single-line comment token for a given language.
 *
 * @param languageId - VS Code `document.languageId` (case-insensitive).
 * @returns Marker string (e.g. `//`, `#`, `--`); `//` when unknown.
 */
export function getLineCommentToken(languageId: string): string {
  const trimmed = languageId?.trim();
  if (!trimmed) {
    return '//';
  }

  const id = trimmed.toLowerCase();
  return LINE_COMMENT_TOKEN_BY_LANGUAGE_ID[id] ?? '//';
}
