# CodeMark+

[![GitHub package.json version](https://img.shields.io/github/package-json/v/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus)
[![GitHub Repo Stars](https://img.shields.io/github/stars/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus)
[![GitHub License](https://img.shields.io/github/license/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/LICENSE)

> Insert language-appropriate documentation blocks, highlight tagged comments from settings, browse those tags across the workspace, and keep a project TODO file next to your code.

## What problem does this solve?

- **Scattered markers** (`TODO:`, `FIXME:`, custom tags) are easy to lose in large repos; you need them **visible in the editor** and **indexed so you can jump to each occurrence**.
- **Repetitive doc comments** (signature, params, file metadata) are tedious to type by hand; you want a **consistent block** driven by templates when the language service exposes a function/method symbol.
- **Lightweight project memory** (a shared TODO) should live **in the workspace** with optional links back to source lines.

CodeMark+ addresses these with configurable highlight rules and decorations, Mustache-based insert templates, a Tag Browser tree backed by the same rules, and a configurable notes folder (default `.codemark`) including a Markdown TODO file.

## What is this extension?

CodeMark+ is a **workspace-scoped** VS Code extension. After you pick a folder (single- or multi-root), it:

- Registers commands for **insert/remove** documentation-style comments, **TODO** workflows, **Tag Browser refresh/open**, and **changing the active workspace folder** for settings.
- Applies **editor decorations** from `codeMarkPlus.highlightRules` (with overlap priority, optional language scoping, and regex rules where configured).
- Runs a **background index** over files matched by your include/exclude globs so the Tag Browser can list matches (with internal caps and caching for responsiveness).

It does **not** replace your language server, formatter, or Git integration; it complements them for comments, markers, and small project notes.

## Core Features

| Area                       | What you get                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Documentation comments** | Insert a Mustache-rendered block from built-in or `customTemplates`; placement uses the document symbol under the cursor when possible, or the current line when `useCurrentPosition` is enabled. The active document’s `languageId` selects the template when it is one of the supported template languages; otherwise `defaultLanguage` applies. |
| **Highlighting**           | Live decorations in the active editor from your rules, plus optional `// HIGHLIGHT:` directives for whole-line emphasis (see Usage).                                                                                                                                                                                                               |
| **Notes**                  | Shared TODO file under `codeMarkPlus.notes.notesFolder`, optional default `(TODO).md`, commands to append content and open the TODO file.                                                                                                                                                                                                          |
| **Tag Browser**            | Explorer view `codeMarkPlus.tagBrowserView`: tree **tag → file → occurrence**; refresh rescans; clicking an occurrence opens the file at that line. Show or hide the section from the Explorer like any built-in view (no extension setting).                                                                                                      |

## How it works

- **Comment generation**: `CommentController` asks VS Code for document symbols, builds `CommentData`, and `CommentService` picks a template (built-in or custom) per **resolved language** (document `languageId` when supported, else `defaultLanguage`), then renders with Mustache.
- **Single-line removal**: `CommentService.findSingleLineComments` scans the active file for **language-appropriate line comment markers** (e.g. `//`, `#`, `--`) derived from `document.languageId` via a small lookup table, with **`//` as fallback** for unknown languages.
- **Highlighting**: `HighlightController` decorates visible ranges (plus a line buffer), skips very large files for full processing, and debounces on edit.
- **Tag index**: `TagIndexService` uses the same normalized rules as highlighting, scans matching files with concurrency and size limits, caches per-file by mtime, and notifies the Tag Browser provider when the index changes.
- **Notes/TODO**: `TodoService` reads and writes the shared TODO file under the notes folder.

## Use cases

- You mark technical debt with `TODO:` / `FIXME:` and want **one place in the sidebar** to drill into every hit across `*.ts` / `*.md` (or your globs).
- You want a **docblock** inserted above the current method without hand-copying `@param` lines when symbols are available.
- You keep a **team TODO** in `(TODO).md` and push items from the editor with “Append to TODO file”.

![CodeMark+ in Action](https://raw.githubusercontent.com/ManuelGil/vscode-code-mark-plus/main/images/vscode-code-mark-plus.gif)

## Table of Contents

- [CodeMark+](#codemark)
  - [What problem does this solve?](#what-problem-does-this-solve)
  - [What is this extension?](#what-is-this-extension)
  - [Core Features](#core-features)
  - [How it works](#how-it-works)
  - [Use cases](#use-cases)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Dynamic Keyword Highlighting](#dynamic-keyword-highlighting)
    - [Special Highlight Directives](#special-highlight-directives)
    - [Insert \& Remove Comments](#insert--remove-comments)
    - [Notes (Project TODO)](#notes-project-todo)
    - [Tag Browser](#tag-browser)
  - [Configuration Options](#configuration-options)
    - [General Settings](#general-settings)
    - [Highlight Rules](#highlight-rules)
    - [Special Highlight Decoration](#special-highlight-decoration)
    - [Feature Settings: Quick Actions](#feature-settings-quick-actions)
    - [Workspace Scanning \& Performance Settings](#workspace-scanning--performance-settings)
    - [Supported Languages](#supported-languages)
    - [Custom Comment Templates](#custom-comment-templates)
  - [Performance](#performance)
  - [Commands and Keybindings](#commands-and-keybindings)
  - [Limitations](#limitations)
  - [Installation \& Usage](#installation--usage)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Changelog](#changelog)
  - [Authors](#authors)
  - [Follow Me](#follow-me)
  - [Other Extensions](#other-extensions)
  - [Recommended Browser Extension](#recommended-browser-extension)
  - [License](#license)

## Usage

### Dynamic Keyword Highlighting

By default, CodeMark+ styles `TODO`, `FIXME`, and `NOTE` based on your configuration.

> Keyword-based rules support both `TODO` and `TODO:` formats for compatibility. Use `matchMode: "regex"` if you need custom separators.

### Special Highlight Directives

Place a directive above or next to code:

```js
// HIGHLIGHT: next line
console.log('This line is highlighted.');
```

Supported directives:

- `next line`, `previous line`, `current line`
- `line <number>`
- `range <start>-<end>`

### Insert & Remove Comments

- **Insert Comment**: `CodeMark+: Insert Comment` (Ctrl+Alt+U / ⌘+Alt+U)
- **Remove single-line comments (picker)**: `CodeMark+: Remove Single-Line Comments` (Ctrl+Alt+Shift+U / ⌘+Alt+Shift+U)
- **Remove all single-line comments**: `CodeMark+: Remove All Single-Line Comments` (palette or editor context menu)

**Language-aware removal:** detection uses the active document’s `languageId` to choose a line marker (for example `//` for JavaScript/TypeScript, `#` for Python and shell scripts, `--` for SQL, `--` for Lua/Haskell). Languages without a dedicated mapping use `//` as a conservative default—verify results on exotic grammars.

**Insert behavior:** when the language server returns a function/method symbol containing the cursor and `useCurrentPosition` is `false`, the block is inserted at the start of that symbol’s range; otherwise it inserts at the current line. Template language resolution prefers `document.languageId` when it matches a supported template language, else `codeMarkPlus.defaultLanguage`.

Access via the Command Palette (Ctrl+Shift+P / ⌘+Shift+P) or the editor context menu where contributed.

### Notes (Project TODO)

Manage a shared TODO file per workspace:

- Append to the TODO file: select text or run "CodeMark+: Append to TODO file" and enter content.
- Open the TODO file: run "CodeMark+: Open TODO file".

The TODO file is created inside your workspace using sensible defaults from the extension configuration.

### Tag Browser

Browse matches for your **highlight rules** across the workspace:

- **View id:** `codeMarkPlus.tagBrowserView` (Explorer sidebar). Visibility is controlled with the normal Explorer UI (e.g. hide/show sections); the extension always registers the tree data provider when active.
- **Tree shape:** **Tag → file → occurrence** (each occurrence opens the file at the matched line when activated).
- **Actions:** title-bar **Refresh** clears the index cache and rescans; the **Open File** command is available from the file item’s context menu (`viewItem == file`).
- **Indexing:** uses the same normalized `highlightRules` as in-editor highlighting (single source of truth), subject to include/exclude globs, optional `.gitignore` respect, file size caps, and internal occurrence limits (see Limitations).

## Configuration Options

You can customize CodeMark+ through your VSCode settings. Below are the main options:

### General Settings

| Setting                                  | Type    | Default      | Description                                         |
| ---------------------------------------- | ------- | ------------ | --------------------------------------------------- |
| `codeMarkPlus.enable`                    | boolean | true         | Enable or disable CodeMark+ features.               |
| `codeMarkPlus.defaultLanguage`           | string  | "javascript" | Default language for comments.                      |
| `codeMarkPlus.isCommentMessageWrapped`   | boolean | false        | Wrap comments with borders if enabled.              |
| `codeMarkPlus.commentDelimiter`          | string  | "~"          | Delimiter used between comment parts.               |
| `codeMarkPlus.commentMessagePrefix`      | string  | "🔹"          | Prefix for inserted comments.                       |
| `codeMarkPlus.commentMessageSuffix`      | string  | ":"          | Suffix for inserted comments.                       |
| `codeMarkPlus.addEmptyLineBeforeComment` | boolean | false        | Add an empty line before the comment block.         |
| `codeMarkPlus.addEmptyLineAfterComment`  | boolean | false        | Add an empty line after the comment block.          |
| `codeMarkPlus.literalOpen`               | string  | "{"          | Opening character for template literals.            |
| `codeMarkPlus.literalClose`              | string  | "}"          | Closing character for template literals.            |
| `codeMarkPlus.useCurrentPosition`        | boolean | false        | Use current cursor position for inserting comments. |
| `codeMarkPlus.author`                    | string  | "Unknown"    | Default author name for comments.                   |
| `codeMarkPlus.version`                   | string  | "1.0.0"      | Default version for comments.                       |
| `codeMarkPlus.license`                   | string  | "MIT"        | Default license for comments.                       |
| `codeMarkPlus.highlightActive`           | boolean | true         | Enable or disable dynamic highlighting.             |

### Highlight Rules

Rules tell CodeMark+ what to detect and how to decorate it. Each rule provides either a `keyword` or a `pattern` (regex), plus a background `color`. Optional fields control styles, matching behavior, language scoping, and overlap resolution.

- `keyword`: text to match (ignored when `pattern` is used)
- `matchMode`: `"word" | "substring" | "regex"` (default inferred: `regex` if `pattern` exists, else `word`)
- `pattern`: ECMAScript regex used when `matchMode` is `regex` (e.g., `BUG-\\d+`)
- `color`: CSS color for background (e.g., `#RRGGBB`, `rgba()`)
- `bold` | `italic` | `underline` | `strikethrough`: text styles
- `caseSensitive`: default `true`
- `wholeWord`: default `true`; applies only to `word` mode; ignored in `substring` and `regex` modes
- `languageIds`: limit to specific VS Code language IDs
- `priority`: number; higher wins when rules overlap (default `0`)

Recommended tags you may want to cover out of the box:

- **Tasks/Issues**: TODO, FIXME, BUG, HACK, WIP, TEMP
- **Refactor/Perf**: REFACTOR, OPTIMIZE, PERF
- **Quality/Security**: WARNING, DEPRECATED, SECURITY, VULN
- **Docs/Info**: NOTE, INFO, DOCS
- **Process/Comm**: REVIEW, QUESTION, IDEA
- **Planning**: NEXT, LATER, IMPORTANT, CRITICAL, BLOCKER, DONE

Comprehensive example:

```json
"codeMarkPlus.highlightRules": [
  { "keyword": "TODO",       "color": "rgba(255,204,0,0.30)",  "bold": true,  "priority": 10 },
  { "keyword": "FIXME",      "color": "rgba(255, 64,64,0.25)",  "bold": true,  "underline": true, "priority": 20 },
  { "keyword": "BUG",        "color": "rgba(255,128, 0,0.25)",  "bold": true },
  { "keyword": "HACK",       "color": "rgba(255,128, 0,0.20)",  "italic": true },
  { "keyword": "WIP",        "color": "rgba(128,128,128,0.20)", "italic": true },
  { "keyword": "TEMP",       "color": "rgba(128,128,128,0.15)", "strikethrough": true },

  { "keyword": "REFACTOR",   "color": "rgba( 64,128,255,0.20)", "bold": true },
  { "keyword": "OPTIMIZE",   "color": "rgba( 64,128,255,0.15)", "italic": true },
  { "keyword": "PERF",       "color": "rgba( 64,128,255,0.15)", "italic": true },

  { "keyword": "WARNING",    "color": "rgba(255,192,  0,0.20)", "bold": true },
  { "keyword": "DEPRECATED", "color": "rgba(192,192,192,0.25)", "strikethrough": true },
  { "keyword": "SECURITY",   "color": "rgba(255,  0,128,0.20)", "bold": true },
  { "keyword": "VULN",       "color": "rgba(255,  0,128,0.20)", "bold": true },

  { "keyword": "NOTE",       "color": "rgba(  0,255,  0,0.20)", "italic": true },
  { "keyword": "INFO",       "color": "rgba(  0,255,  0,0.15)", "italic": true },
  { "keyword": "DOCS",       "color": "rgba(  0,255,128,0.15)", "italic": true },

  { "keyword": "REVIEW",     "color": "rgba(128, 64,255,0.20)", "underline": true },
  { "keyword": "QUESTION",   "color": "rgba(128, 64,255,0.15)", "italic": true },
  { "keyword": "IDEA",       "color": "rgba(128, 64,255,0.15)", "italic": true },

  { "keyword": "NEXT",       "color": "rgba(  0,192,255,0.20)", "bold": true },
  { "keyword": "LATER",      "color": "rgba(  0,192,255,0.15)" },
  { "keyword": "IMPORTANT",  "color": "rgba(255, 64,  0,0.25)", "bold": true },
  { "keyword": "CRITICAL",   "color": "rgba(255,  0,  0,0.25)", "bold": true, "priority": 30 },
  { "keyword": "BLOCKER",    "color": "rgba(255,  0,  0,0.25)", "bold": true, "priority": 30 },
  { "keyword": "DONE",       "color": "rgba(  0,255,128,0.12)", "strikethrough": true },

  { "matchMode": "regex", "pattern": "BUG-\\d+",           "color": "rgba(255,128,0,0.18)",  "italic": true },
  { "matchMode": "regex", "pattern": "[A-Z]{2,5}-\\d{1,6}", "color": "rgba(  0,192,255,0.15)", "underline": true },
  { "keyword": "TODO", "color": "rgba(255,204,0,0.30)", "bold": true, "languageIds": ["typescript", "javascript"] }
]
```

Notes and tips:

- **Overlap and priority**: When two rules match the same range, the one with higher `priority` is applied. If equal, the first applied may win depending on implementation order.
- **Case sensitivity and words**: `caseSensitive` defaults to `true`. `wholeWord` applies only to `word` mode and is ignored in `substring` and `regex`. A warning is emitted if `wholeWord` is set with those modes.
- **Language scoping**: Use `languageIds` to avoid noise across file types (e.g., reserve `TODO` styles for code, different for `markdown`).
- **Performance**: Prefer concise regex and keep the number of active rules reasonable for very large workspaces.
- **Regex safety**: Invalid regex patterns are ignored to prevent errors, and a status bar message is shown to indicate the problem.
- **Keyword compatibility**: Keyword-based rules (non-`regex`) support both `TODO` and `TODO:`. Tag Browser scanning follows the same rule for consistency. Use `matchMode: "regex"` if you need different separators.

### Special Highlight Decoration

Customize the appearance of the special highlight applied for directives:

```json
"codeMarkPlus.specialHighlightDecoration": {
  "backgroundColor": "rgba(0,128,255,0.3)",
  "border": "1px solid blue",
  "isWholeLine": true
}
```

### Feature Settings: Quick Actions

Define custom actions that can be surfaced by the extension (e.g., buttons/menus) and executed via VS Code commands. Each action provides a display `name`, the VS Code `command` id to run, optional `args` array, and optional `shortcut`/`icon` metadata.

```json
"codeMarkPlus.features.quickActions": [
  { "name": "Format Document", "command": "editor.action.formatDocument" },
  { "name": "Organize Imports", "command": "editor.action.organizeImports", "args": [] },
  { "name": "Toggle Word Wrap", "command": "editor.action.toggleWordWrap", "icon": "wrap" }
]
```

Notes:

- `command` must be a valid VS Code command id (built-in or contributed by extensions).
- `args` (if provided) are forwarded to the command.
- `shortcut` and `icon` are optional metadata that may be used by UI surfaces to present the action.

### Workspace Scanning & Performance Settings

These settings control discovery scope and file filtering used by the Tag Browser:

| Setting                                        | Type     | Default                                                             | Description                                                  |
| ---------------------------------------------- | -------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `codeMarkPlus.files.includedFilePatterns`      | string[] | `["**/*{js,ts,md}"]`                                                | Glob patterns to include when scanning the workspace.        |
| `codeMarkPlus.files.excludedFilePatterns`      | string[] | `["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"]` | Glob patterns to exclude from scans.                         |
| `codeMarkPlus.files.maxSearchRecursionDepth`   | number   | `0`                                                                 | Maximum recursion depth for file search (`0` = unlimited).   |
| `codeMarkPlus.files.supportsHiddenFiles`       | boolean  | `false`                                                             | Whether to include hidden files and folders.                 |
| `codeMarkPlus.files.preserveGitignoreSettings` | boolean  | `true`                                                              | Whether to respect patterns from `.gitignore`.               |
| `codeMarkPlus.files.showFilePathInResults`     | boolean  | `true`                                                              | Show relative path next to file name in Tag Browser results. |

### Supported Languages

CodeMark+ supports multiple programming languages for highlighting and comment management:

- **JavaScript (`javascript`)**
- **TypeScript (`typescript`)**
- **Java (`java`)**
- **C# (`csharp`)**
- **PHP (`php`)**
- **Dart (`dart`)**
- **Python (`python`)**
- **C++ (`cpp`)**
- **Ruby (`ruby`)**
- **Go (`go`)**
- **Kotlin (`kotlin`)**
- **Swift (`swift`)**
- **Scala (`scala`)**
- **Lua (`lua`)**
- **Perl (`perl`)**
- **Elixir (`elixir`)**
- **Haskell (`haskell`)**

### Custom Comment Templates

Define custom comment templates for different languages using Mustache syntax. For example:

```json
"codeMarkPlus.customTemplates": [
  {
    "language": "javascript",
    "template": [
      "{{indent}}/**",
      "{{indent}} * @description the {{functionName}} method",
      "{{indent}} * @signature {{signature}}",
      "{{indent}} * @params:",
      "{{#parameters}}{{indent}} *   - {{.}}",
      "{{/parameters}}",
      "{{indent}} * @returns {Type} - {{returnType}}",
      "{{indent}} * @file {{fileName}}",
      "{{indent}} * @date {{date}}",
      "{{indent}} * @author {{author}}",
      "{{indent}} * @version {{version}}",
      "{{indent}} * @license {{license}}",
      "{{indent}} */"
    ]
  },
  {
    "language": "python",
    "template": [
      "{{indent}}\"\"\"",
      "{{indent}}Description: the {{functionName}} method",
      "{{indent}}Signature: {{signature}}",
      "{{indent}}Parameters:",
      "{{#parameters}}{{indent}}    - {{.}}",
      "{{/parameters}}",
      "{{indent}}Returns: {{returnType}}",
      "{{indent}}File: {{fileName}}",
      "{{indent}}Date: {{date}}",
      "{{indent}}Author: {{author}}",
      "{{indent}}Version: {{version}}",
      "{{indent}}License: {{license}}",
      "{{indent}}\"\"\""
    ]
  },
  {
    "language": "kotlin",
    "template": [
      "{{indent}}/**",
      "{{indent}} * @description the {{functionName}} method",
      "{{indent}} * @signature {{signature}}",
      "{{indent}} * @params:",
      "{{#parameters}}{{indent}} *   - {{.}}",
      "{{/parameters}}",
      "{{indent}} * @returns {Type} - {{returnType}}",
      "{{indent}} * @file {{fileName}}",
      "{{indent}} * @date {{date}}",
      "{{indent}} * @author {{author}}",
      "{{indent}} * @version {{version}}",
      "{{indent}} * @license {{license}}",
      "{{indent}} */"
    ]
  }
]
```

## Performance

CodeMark+ is designed to be responsive on large files and workspaces.

- Scans visible ranges with a buffer and updates on `onDidChangeTextEditorVisibleRanges`.
- Debounced updates and chunked processing for large documents.
- Configurable performance settings (via `codeMarkPlus.*`):
  - `maxFilesToIndex`: 1000
  - `concurrencyLimit`: 10
  - `batchSize`: 10
- Note: These settings are read from configuration and reserved for upcoming indexing enhancements.
- Respects `codeMarkPlus.files.excludedFilePatterns` and applies conservative limits for very large files to keep the editor responsive.
- For extremely large files, full highlighting is skipped above ~1 MB to keep VS Code responsive.
- Adaptive limits: heuristics adjust chunking/thresholds based on document/workspace size.

## Commands and Keybindings

| Command                                    | Windows/Linux    | macOS         | Description                                                                                   |
| ------------------------------------------ | ---------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `codeMarkPlus.insertComment`               | Ctrl+Alt+U       | ⌘+Alt+U       | Insert documentation comment block (see Usage).                                               |
| `codeMarkPlus.removeSingleLineComments`    | Ctrl+Alt+Shift+U | ⌘+Alt+Shift+U | Quick Pick: remove chosen single-line comments (marker from `languageId`).                    |
| `codeMarkPlus.removeAllSingleLineComments` | —                | —             | Remove every detected single-line comment in the active editor (no per-line confirmation).    |
| `codeMarkPlus.changeWorkspace`             | —                | —             | Pick workspace folder for `codeMarkPlus.*` settings (multi-root).                             |
| `codeMarkPlus.tagBrowserView.refreshList`  | —                | —             | Clear tag index cache and rescan workspace; tree refreshes when indexing completes.           |
| `codeMarkPlus.tagBrowserView.openFile`     | —                | —             | Open a file URI (and optional line); used from Tag Browser context menu, hidden from palette. |
| `codeMarkPlus.createProjectNote`           | —                | —             | Create Markdown note under the notes folder.                                                  |
| `codeMarkPlus.openProjectNote`             | —                | —             | Open an existing note from Quick Pick.                                                        |
| `codeMarkPlus.insertNoteLink`              | —                | —             | Insert Markdown link to a note at the cursor.                                                 |
| `codeMarkPlus.appendToTodoFile`            | —                | —             | Append selection or prompted text to the configured TODO file.                                |
| `codeMarkPlus.openTodoFile`                | —                | —             | Open the TODO Markdown file.                                                                  |

Customize shortcuts in **Keyboard Shortcuts** settings.

## Limitations

- **Workspace required:** activation expects a workspace folder; opening loose files without a folder is not supported for the full feature set.
- **`HIGHLIGHT:` directives** are detected only on lines matching the built-in pattern **`// HIGHLIGHT:`** (C-style). Other comment styles are not interpreted for this feature.
- **Single-line removal** uses a **heuristic line scan** (marker at start of match on the line); it can mis-detect markers inside string literals on rare occasions. Unknown `languageId` values fall back to `//`.
- **Very large files:** editor highlighting skips aggressive processing above ~**1 MiB**; tag indexing also skips larger files for scanning.
- **Tag index caps:** internal limits bound total entries, per-tag entries, and per-file matches so huge repos stay responsive; the tree may be **truncated** relative to a full textual search.
- **Symbol-based insert:** if the language extension does not expose `Function`/`Method` symbols, insert falls back to the current line (or always when `useCurrentPosition` is `true`).

## Installation & Usage

1. Launch **Visual Studio Code** (or VSCodium, WindSurf, Cursor).
2. Open the **Extensions** view (`Ctrl+Shift+X` on Windows/Linux or `⌘+Shift+X` on macOS).
3. Search for **CodeMark+** or install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus).
4. Click **Install** and reload the editor when prompted.
5. **Open a folder or multi-root workspace** so the extension can load `codeMarkPlus` settings and file globs.
6. Add or confirm `codeMarkPlus.highlightRules` in `settings.json` (see [Highlight Rules](#highlight-rules)).
7. In the Explorer, open **Tag Browser**, use **Refresh** once, then expand **tag → file → occurrence** to navigate hits.
8. Use the Command Palette category **codeMark+** (or keybindings above) for comments, notes, and TODO actions.

## Contributing

CodeMark+ is open-source and welcomes community contributions:

1. Fork the [GitHub repository](https://github.com/ManuelGil/vscode-code-mark-plus).
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Make your changes, commit them, and push to your fork.
4. Submit a Pull Request against the `main` branch.

Before contributing, please review the [Contribution Guidelines](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/CONTRIBUTING.md) for coding standards, testing, and commit message conventions. Open an Issue if you find a bug or want to request a new feature.

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all, regardless of gender, sexual orientation, disability, ethnicity, religion, or other personal characteristic. Please review our [Code of Conduct](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/CODE_OF_CONDUCT.md) before participating in our community.

## Changelog

For a complete list of changes, see the [CHANGELOG.md](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/CHANGELOG.md).

## Authors

- **Manuel Gil** - _Owner_ - [@ManuelGil](https://github.com/ManuelGil)

See also the list of [contributors](https://github.com/ManuelGil/vscode-code-mark-plus/contributors) who participated in this project.

## Follow Me

- **GitHub**: [![GitHub followers](https://img.shields.io/github/followers/ManuelGil?style=for-the-badge\&logo=github)](https://github.com/ManuelGil)
- **X (formerly Twitter)**: [![X Follow](https://img.shields.io/twitter/follow/imgildev?style=for-the-badge\&logo=x)](https://twitter.com/imgildev)

## Other Extensions

- **[Auto Barrel](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-auto-barrel)**
  Automatically generates and maintains barrel (`index.ts`) files for your TypeScript projects.

- **[Angular File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-angular-generator)**
  Generates boilerplate and navigates your Angular (9→20+) project from within the editor, with commands for components, services, directives, modules, pipes, guards, reactive snippets, and JSON2TS transformations.

- **[NestJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nestjs-generator)**
  Simplifies creation of controllers, services, modules, and more for NestJS projects, with custom commands and Swagger snippets.

- **[NestJS Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nestjs-snippets-extension)**
  Ready-to-use code patterns for creating controllers, services, modules, DTOs, filters, interceptors, and more in NestJS.

- **[T3 Stack / NextJS / ReactJS File Generator](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-nextjs-generator)**
  Automates file creation (components, pages, hooks, API routes, etc.) in T3 Stack (Next.js, React) projects and can start your dev server from VSCode.

- **[Drizzle ORM Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-drizzle-snippets)**
  Collection of code snippets to speed up Drizzle ORM usage, defines schemas, migrations, and common database operations in TypeScript/JavaScript.

- **[CodeIgniter 4 Spark](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-spark)**
  Scaffolds controllers, models, migrations, libraries, and CLI commands in CodeIgniter 4 projects using Spark, directly from the editor.

- **[CodeIgniter 4 Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-snippets)**
  Snippets for accelerating development with CodeIgniter 4, including controllers, models, validations, and more.

- **[CodeIgniter 4 Shield Snippets](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-codeigniter4-shield-snippets)**
  Snippets tailored to CodeIgniter 4 Shield for faster authentication and security-related code.

- **[Mustache Template Engine - Snippets & Autocomplete](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-mustache-snippets)**
  Snippets and autocomplete support for Mustache templates, making HTML templating faster and more reliable.

## Recommended Browser Extension

For developers who work with `.vsix` files for offline installations or distribution, the complementary [**One-Click VSIX**](https://chromewebstore.google.com/detail/imojppdbcecfpeafjagncfplelddhigc?utm_source=item-share-cb) extension is recommended, available for both Chrome and Firefox.

> **One-Click VSIX** integrates a direct "Download Extension" button into each VSCode Marketplace page, ensuring the file is saved with the `.vsix` extension, even if the server provides a `.zip` archive. This simplifies the process of installing or sharing extensions offline by eliminating the need for manual file renaming.

- [Get One-Click VSIX for Chrome &rarr;](https://chromewebstore.google.com/detail/imojppdbcecfpeafjagncfplelddhigc?utm_source=item-share-cb)
- [Get One-Click VSIX for Firefox &rarr;](https://addons.mozilla.org/es-ES/firefox/addon/one-click-vsix/)

## License

This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/LICENSE) file for details.
