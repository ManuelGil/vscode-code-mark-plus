# CodeMark+

[![GitHub package.json version](https://img.shields.io/github/package-json/v/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus)
[![GitHub Repo Stars](https://img.shields.io/github/stars/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus)
[![GitHub License](https://img.shields.io/github/license/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/LICENSE)

> Fast developer-focused annotation workflows for comments, TODOs, highlights, and lightweight workspace documentation directly inside VS Code.

CodeMark+ helps you create, organize, highlight, and navigate developer annotations without leaving your coding workflow.

It combines:

- **customizable comment templates**
- **workspace-wide tag navigation**
- **live annotation highlighting**
- **lightweight shared notes**
- **developer-focused TODO workflows**
- Replace annotation tags within the active editor selection.

into a cohesive annotation system designed for real-world development workflows.

## Why CodeMark+ Exists

Developer annotations are everywhere:

```ts
// TODO: remove legacy auth flow
// FIXME: race condition during refresh
// NOTE: keep aligned with API v2
// HACK: temporary compatibility patch
```

But in most projects these annotations become:

- scattered
- invisible
- inconsistent
- difficult to navigate
- disconnected from the actual workflow

At the same time, repetitive documentation comments and lightweight project notes often require unnecessary manual effort.

CodeMark+ is designed to make annotations feel:

- visible
- structured
- searchable
- configurable
- lightweight
- naturally integrated into the editor

without turning your workspace into a heavyweight documentation system.

![CodeMark+ in Action](https://raw.githubusercontent.com/ManuelGil/vscode-code-mark-plus/main/images/vscode-code-mark-plus.gif)

## What CodeMark+ Is

CodeMark+ is a workspace-focused annotation and documentation extension for VS Code.

It provides:

- annotation generation using customizable Mustache templates
- live highlighting for TODO/FIXME/NOTE-style markers
- a Tag Browser for navigating annotations across the workspace
- lightweight Markdown-based project notes
- shared TODO workflows
- configurable annotation formatting and behaviors

The extension is designed to complement your existing development workflow - not replace your formatter, language server, issue tracker, or documentation platform.

## Core Workflow

A typical workflow in CodeMark+ looks like this:

1. Add annotations while coding

      ```ts
      // TODO: optimize cache invalidation
      // FIXME: duplicate API request
      // NOTE: temporary migration logic
      ```

2. See annotations highlighted directly in the editor

3. Navigate them later using the Tag Browser

      ```text
      TODO
      └── auth.service.ts
            └── optimize cache invalidation

      FIXME
      └── api.client.ts
            └── duplicate API request
      ```

4. Create structured documentation comments using reusable templates

5. Keep lightweight shared workspace notes close to the codebase

The goal is to reduce friction while keeping developer context visible and accessible.

## Philosophy

CodeMark+ is intentionally:

- lightweight
- workspace-oriented
- developer-focused
- highly configurable
- annotation-centric

It is **not**:

- a PKM platform
- a semantic graph system
- an AI documentation engine
- a YAML knowledge framework
- a replacement for full documentation platforms

Annotations should feel fast, useful, and natural - not ceremonial.

## Core Features

### Annotation Highlighting

CodeMark+ can highlight developer annotations directly inside the editor using customizable rules.

Supported workflows include:

- TODO tracking
- FIXME visibility
- NOTE reminders
- HACK warnings
- custom annotation tags

Example:

```ts
// TODO: refactor auth middleware
// FIXME: duplicate websocket subscription
// NOTE: remove after API v3 migration
```

Annotations remain visible while coding, reducing the chance of losing important operational context.

### Workspace Tag Browser

The Tag Browser provides a workspace-wide view of annotations grouped by tag.

Example structure:

```text
TODO
 ├── auth.service.ts
 │    └── refactor auth middleware
 │
 └── cache.manager.ts
      └── optimize invalidation strategy

FIXME
 └── websocket.ts
      └── duplicate websocket subscription
```

This makes it easier to:

- revisit pending work
- navigate technical debt
- track temporary decisions
- surface operational notes
- coordinate lightweight team workflows

The Tag Browser is designed to keep annotations discoverable without requiring external tooling.

### Customizable Annotation Templates

CodeMark+ includes a configurable template engine for generating structured comments and documentation blocks.

Templates support:

- multiple programming languages
- Mustache variables
- reusable documentation structures
- configurable wrapping behaviors
- customizable formatting styles

Example:

```json
{
  "language": "typescript",
  "template": [
    "/**",
    " * {{functionName}}",
    " *",
    " * @description {{description}}",
    " * @returns {{returnType}}",
    " */"
  ]
}
```

Generated output:

```ts
/**
 * fetchUserProfile
 *
 * @description Retrieves the active user profile
 * @returns Promise<UserProfile>
 */
```

The goal is to reduce repetitive documentation effort while preserving developer control over formatting and style.

### Lightweight Workspace Notes

CodeMark+ also supports lightweight Markdown-based workspace notes for fast operational context.

Examples include:

- scratchpads
- implementation reminders
- migration notes
- temporary investigation logs
- shared TODO tracking

These notes are intentionally lightweight and workspace-oriented.

They are designed to complement annotation workflows - not replace full documentation systems.

## Common Workflows

### Track Technical Debt

```ts
// TODO: remove legacy auth adapter
// FIXME: retry loop can duplicate requests
```

Use highlighting and the Tag Browser to keep debt visible while developing.

### Generate Consistent Documentation

Use reusable templates to generate structured comments across projects and languages.

Especially useful for:

- shared team conventions
- large codebases
- repetitive APIs
- service layers
- public SDKs

### Maintain Lightweight Operational Context

Keep temporary decisions and implementation notes close to the workspace without introducing heavyweight documentation processes.

## Designed for Real Development Workflows

CodeMark+ works best when annotations are treated as:

- operational context
- implementation memory
- lightweight coordination
- fast documentation
- visible technical signals

instead of hidden comments scattered across the codebase.

## Screenshots

> Replace the following placeholders with updated screenshots focused on workflows rather than isolated features.

### Annotation Highlighting

*Show highlighted TODO/FIXME/NOTE annotations directly inside the editor.*

### Tag Browser Navigation

*Show workspace-wide annotation navigation grouped by tag.*

### Comment Template Generation

*Show generated documentation comments from reusable templates.*

### Workspace Notes

*Show lightweight Markdown notes integrated into the workspace workflow.*

## Configuration

CodeMark+ is intentionally configurable.

The extension is designed to support different annotation styles, team conventions, and documentation workflows without forcing a rigid structure.

## Highlight Rules

Highlighting behavior can be customized using annotation rules.

Example:

```json
"codeMarkPlus.highlight.highlightRules": [
  {
    "tag": "TODO",
    "color": "#FFCC00",
    "fontWeight": "bold"
  },
  {
    "tag": "FIXME",
    "color": "#FF5555"
  },
  {
    "tag": "NOTE",
    "color": "#4FC1FF"
  }
]
```

This allows teams to create consistent visual annotation systems directly inside the editor.

## Annotation Templates

Templates can be customized per language using Mustache placeholders.

Example:

```json
"codeMarkPlus.templates.customTemplates": [
  {
    "language": "typescript",
    "template": [
      "/**",
      " * {{functionName}}",
      " *",
      " * @description {{description}}",
      " */"
    ]
  }
]
```

Templates support:

- reusable documentation structures
- language-specific formatting
- configurable wrapping behavior
- custom annotation styles

The template system is designed to reduce repetitive documentation work while preserving flexibility.

## Storage Philosophy

Workspace notes and annotation-related files are intentionally lightweight and developer-owned.

The goal is to keep operational context:

- visible
- portable
- versionable
- easy to share
- close to the codebase

without introducing heavyweight external systems.

## Performance

CodeMark+ is designed to remain lightweight during everyday development workflows.

The extension focuses on:

- fast annotation discovery
- responsive highlighting
- minimal workflow interruption
- workspace-oriented navigation

while avoiding unnecessary complexity.

## Design Philosophy

CodeMark+ prioritizes:

- fast operational annotations
- configurable documentation workflows
- visible developer context
- lightweight workspace memory
- annotation discoverability

The extension intentionally avoids becoming:

- a semantic graph platform
- a PKM system
- an AI orchestration layer
- a heavyweight documentation framework

The focus remains on keeping annotations useful, accessible, and naturally integrated into development workflows.

## Best Use Cases

CodeMark+ works especially well for:

- TODO/FIXME workflows
- lightweight technical debt tracking
- operational implementation notes
- structured code documentation
- shared annotation conventions
- large codebases with scattered comments
- teams using annotation-driven workflows
- developer-focused workspace documentation

## Requirements

- Visual Studio Code ^1.102.0

## Extension Settings

CodeMark+ includes configurable settings for:

- annotation highlighting
- template generation
- wrapping behavior
- Tag Browser behavior
- Markdown workspace notes
- formatting preferences
- language-specific templates

Open:

```text
Preferences → Settings → CodeMark+
```

to explore available configuration options.

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
