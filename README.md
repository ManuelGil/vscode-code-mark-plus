# CodeMark+

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/imgildev.vscode-code-mark-plus?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/imgildev.vscode-code-mark-plus?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/imgildev.vscode-code-mark-plus?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/imgildev.vscode-code-mark-plus?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus&ssr=false#review-details)
[![GitHub Repo Stars](https://img.shields.io/github/stars/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus)
[![GitHub License](https://img.shields.io/github/license/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/LICENSE)

> A VS Code extension for inserting, removing, and highlighting custom comments and directives across multiple languages.

## Overview

CodeMark+ enables:

- **Dynamic Keyword Highlighting**: Automatically style `TODO`, `FIXME`, `NOTE`, and custom keywords.
- **Special Highlight Directives**: Inline comments (e.g. `// HIGHLIGHT: next line`, `// HIGHLIGHT: range 5-8`) to target lines or blocks.
- **Custom Comment Templates**: Mustache‑based templates for consistent documentation blocks.
- **Bulk Operations**: Insert, remove, highlight, and clear comments via commands or shortcuts.
- **Multi‑Language Support**: JavaScript, TypeScript, Python, Java, C#, PHP, Dart, C++, Ruby, Go, Kotlin, Swift, Scala, Lua, Perl, Elixir, Haskell.

![CodeMark+ in Action](https://raw.githubusercontent.com/ManuelGil/vscode-code-mark-plus/main/images/vscode-code-mark-plus.gif)

## Table of Contents

- [CodeMark+](#codemark)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Features](#features)
  - [Usage](#usage)
    - [Dynamic Keyword Highlighting](#dynamic-keyword-highlighting)
    - [Special Highlight Directives](#special-highlight-directives)
    - [Insert \& Remove Comments](#insert--remove-comments)
  - [Configuration Options](#configuration-options)
    - [General Settings](#general-settings)
    - [Highlight Rules](#highlight-rules)
    - [Special Highlight Decoration](#special-highlight-decoration)
    - [Supported Languages](#supported-languages)
    - [Custom Comment Templates](#custom-comment-templates)
  - [Commands and Keybindings](#commands-and-keybindings)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Changelog](#changelog)
  - [Authors](#authors)
  - [Follow Me](#follow-me)
  - [Other Extensions](#other-extensions)
  - [Recommended Browser Extension](#recommended-browser-extension)
  - [License](#license)

## Installation

1. Launch **Visual Studio Code** (or VSCodium, WindSurf, Cursor).
2. Open the **Extensions** view (`Ctrl+Shift+X` on Windows/Linux or `⌘+Shift+X` on macOS).
3. Search for **CodeMark+** or install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus).
4. Click **Install** and reload the editor when prompted.

## Features

- **Real‑Time Highlighting**: Styles keywords and directives as you type.
- **Customizable Rules**: Define colors, font styles, and keywords in settings.
- **Inline Directives**: Highlight next/previous/current line, specific line, or range.
- **Comment Management**: Commands to insert, remove, and clear comments.
- **Keyboard Shortcuts**: Quick access to all commands.
- **Performance Optimized**: Efficient scanning, lazy updates, and caching for large workspaces.

## Usage

### Dynamic Keyword Highlighting

By default, CodeMark+ styles `TODO`, `FIXME`, and `NOTE` based on your configuration.

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
- **Remove Comments**: `CodeMark+: Remove Single‑Line Comments` (Ctrl+Alt+Shift+U / ⌘+Alt+Shift+U)

Access via the Command Palette (Ctrl+Shift+P / ⌘+Shift+P).

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

Define your custom highlight rules for keywords:

```json
"codeMarkPlus.highlightRules": [
  { "keyword": "TODO", "color": "rgba(255,204,0,0.3)", "bold": true },
  { "keyword": "FIXME", "color": "rgba(255,0,0,0.3)", "bold": true, "underline": true },
  { "keyword": "NOTE", "color": "rgba(0,255,0,0.3)", "italic": true }
]
```

### Special Highlight Decoration

Customize the appearance of the special highlight applied for directives:

```json
"codeMarkPlus.specialHighlightDecoration": {
  "backgroundColor": "rgba(0,128,255,0.3)",
  "border": "1px solid blue",
  "isWholeLine": true
}
```

### Supported Languages

CodeLog+ supports multiple programming languages for log generation:

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

## Commands and Keybindings

| Command                                 | Windows/Linux    | macOS         | Description                           |
| --------------------------------------- | ---------------- | ------------- | ------------------------------------- |
| `codeMarkPlus.insertComment`            | Ctrl+Alt+U       | ⌘+Alt+U       | Insert custom comment block.          |
| `codeMarkPlus.removeSingleLineComments` | Ctrl+Alt+Shift+U | ⌘+Alt+Shift+U | Remove inserted single‑line comments. |

Customize shortcuts in **Keyboard Shortcuts** settings.

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
