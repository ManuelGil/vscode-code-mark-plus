# CodeMark+

[![GitHub package.json version](https://img.shields.io/github/package-json/v/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://marketplace.visualstudio.com/items?itemName=imgildev.vscode-code-mark-plus)
[![GitHub Repo Stars](https://img.shields.io/github/stars/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus)
[![GitHub License](https://img.shields.io/github/license/ManuelGil/vscode-code-mark-plus?style=for-the-badge&logo=github)](https://github.com/ManuelGil/vscode-code-mark-plus/blob/main/LICENSE)

> Lightweight annotations, contextual navigation, and developer workflows for Visual Studio Code.

CodeMark+ helps developers keep implementation context visible directly inside the editor using annotations, workspace navigation, contextual links, and Markdown-friendly workflows.

Instead of moving technical context into external systems, CodeMark+ keeps it close to the code.

![Workspace annotation highlighting and navigation in VS Code.](https://raw.githubusercontent.com/ManuelGil/vscode-code-mark-plus/main/images/annotation-browser-and-highlighting.png)

## Why Developers Use CodeMark+

Most projects already contain annotations like:

```ts
// TODO: remove legacy auth flow
// FIXME: websocket reconnect race condition
// NOTE: aligned with API v2
// HACK: temporary compatibility layer
```

The problem is that these annotations often become:

- scattered across files
- difficult to revisit later
- disconnected from implementation notes
- easy to ignore during development

CodeMark+ helps turn those annotations into visible, navigable development context without forcing heavyweight workflows or external systems.

## Core Features

| Feature                     | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| Annotation Highlighting     | Highlight TODO, FIXME, NOTE, HACK, and custom tags directly in the editor |
| Workspace Tag Browser       | Navigate annotations across the workspace                                 |
| Contextual Navigation       | Open files, anchors, and ranges directly from Markdown or plaintext       |
| Markdown Navigation         | Navigate between notes and source code                                    |
| Highlight Directives        | Highlight lines, ranges, or blocks using inline directives                |
| Comment Templates           | Generate reusable annotation or documentation structures                  |
| Annotation Cleanup          | Remove annotation comments safely                                         |
| Multi-Language Support      | Supports multiple programming languages                                   |
| Filesystem-Native Workflows | References and notes remain local and versionable                         |

## Annotation Highlighting

CodeMark+ highlights annotations directly inside the editor while you work.

```ts
// TODO: refactor retry strategy
// FIXME: websocket reconnect race condition
// NOTE: remove after migration
// HACK: temporary compatibility patch
```

Highlights update dynamically as files change and can be customized using flexible highlight rules.

Supported workflows include:

- technical debt tracking
- migration reminders
- debugging sessions
- review flows
- temporary implementation notes
- custom annotation systems

## Workspace Tag Browser

The Tag Browser provides a workspace-wide view of annotations grouped by tag.

Example:

```text
TODO
 ├── auth.service.ts
 │    └── remove retry duplication
 │
 └── cache.manager.ts
      └── optimize invalidation flow

FIXME
 └── websocket.ts
      └── reconnect race condition
```

The browser supports:

- click-to-open navigation
- grouped annotation visibility
- technical debt discovery
- implementation tracking
- lightweight workspace coordination

## Contextual Navigation

![Contextual navigation between Markdown notes and source code.](https://raw.githubusercontent.com/ManuelGil/vscode-code-mark-plus/main/images/markdown-contextual-navigation.png)

CodeMark+ supports navigation between Markdown and source code using plain-text references.

References remain portable, versionable, and editor-friendly.

### Supported References

#### File References

```text
src/auth/auth.service.ts
```

#### Line Anchors

```text
src/auth/auth.service.ts#20
```

#### Explicit Ranges

```text
src/auth/auth.service.ts#20-40
```

#### Annotation References

```text
TODO(src/auth/auth.service.ts)
FIXME(src/auth/auth.service.ts#20)
NOTE(src/auth/auth.service.ts#20-40)
```

CodeMark+ can also discover annotations near referenced files or ranges, making it easier to reconnect notes with implementation details.

## Markdown Navigation

CodeMark+ allows Markdown notes and operational documents to reference implementation context directly.

```md
### Websocket Migration

See:
backend/ws/reconnect.ts#20

TODO(backend/ws/reconnect.ts#20-40)
```

Supported sources include:

- Markdown documents
- plaintext files
- task lists
- frontmatter references
- investigation notes
- implementation notes

Navigation works using:

- Ctrl+Click
- command links
- editor-native navigation behavior

References remain navigable even as files evolve over time.

## Highlight Directives

CodeMark+ supports inline highlight directives for visually emphasizing nearby code.

Example:

```ts
// HIGHLIGHT: line 42

// HIGHLIGHT: range 10-20

// HIGHLIGHT-BEGIN
reconnectWebsocket();
syncSubscriptions();
// HIGHLIGHT-END
```

Supported directives include:

| Directive                           | Behavior                    |
| ----------------------------------- | --------------------------- |
| `line 10`                           | Highlight a specific line   |
| `range 5-10`                        | Highlight a line range      |
| `HIGHLIGHT-BEGIN` / `HIGHLIGHT-END` | Highlight an explicit block |

These directives are useful for:

- debugging sessions
- code walkthroughs
- onboarding
- temporary reviews
- implementation visibility

## Comment & Annotation Templates

CodeMark+ supports reusable Mustache-based templates for generating annotations and documentation blocks.

Templates are customizable per language and workflow.

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

Generated output:

```ts
/**
 * fetchUserProfile
 *
 * @description Retrieves the active user profile
 */
```

Templates can be used for:

- reusable comments
- structured documentation
- shared team conventions
- lightweight annotation workflows
- service documentation

## Annotation Cleanup

CodeMark+ includes cleanup utilities for removing annotation comments safely.

Supported cleanup scopes include:

| Scope               | Description                              |
| ------------------- | ---------------------------------------- |
| All Comments        | Remove all detected single-line comments |
| Annotation Comments | Remove annotation comments only          |
| Specific Tags       | Remove comments matching specific tags   |

Example workflows:

```text
Remove all TODO annotations
Remove all FIXME annotations
Clean temporary review comments
```

Cleanup operations remain language-aware and respect each language's comment syntax.

## Configuration

CodeMark+ is intentionally configurable while remaining lightweight by default.

The extension supports:

- custom annotation tags
- custom highlight rules
- contextual navigation behavior
- annotation templates
- Tag Browser workflows
- cleanup operations
- Markdown navigation
- multi-language behavior

Open:

```text
Preferences → Settings → CodeMark+
```

to explore available settings.

## Highlight Rules

Highlight behavior can be customized using annotation rules.

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
    "color": "#FF5555",
    "underline": true
  },
  {
    "tag": "NOTE",
    "color": "#4FC1FF",
    "italic": true
  }
]
```

Supported capabilities include:

- keyword matching
- regex matching
- substring matching
- per-language scoping
- priorities
- decoration styling
- overlap resolution

## Special Highlight Decorations

Highlight directive decorations can also be customized.

Example:

```json
"codeMarkPlus.highlight.specialHighlightDecoration": {
  "backgroundColor": "rgba(0,128,255,0.3)",
  "border": "1px solid blue",
  "isWholeLine": true
}
```

This allows teams to create visual annotation systems adapted to their workflows.

## Commands

| Command                                 | Description                                  |
| --------------------------------------- | -------------------------------------------- |
| `codeMarkPlus.insertComment`            | Insert annotation or template comment        |
| `codeMarkPlus.removeSingleLineComments` | Remove annotation comments                   |
| `codeMarkPlus.replaceAnnotationTag`     | Replace annotation tags in selection or file |
| `codeMarkPlus.openAddress`              | Open contextual file references              |
| `codeMarkPlus.tags.refresh`             | Refresh Tag Browser indexing                 |

Example workflows:

```text
Insert TODO annotation
Replace NOTE → FIXME
Navigate to src/auth/auth.service.ts#20
Refresh workspace annotations
```

## Multi-Language Support

CodeMark+ supports annotation workflows across multiple languages.

Examples include:

- JavaScript
- TypeScript
- Python
- Java
- PHP
- Dart
- Go
- Ruby
- C#
- C++
- additional languages supported through configurable comment parsing

Language-aware behavior includes:

- comment syntax detection
- annotation extraction
- cleanup operations
- template generation
- contextual parsing

## Performance

CodeMark+ is designed to remain lightweight during normal development workflows.

The extension focuses on:

- responsive highlighting
- bounded workspace scanning
- lightweight indexing
- deterministic behavior
- minimal workflow interruption

The runtime includes:

- file size limits
- lazy initialization
- caching strategies
- bounded indexing
- concurrency control

to avoid slowing down the editor during large workspace operations.

## Typical Workflows

### Technical Debt Tracking

```ts
// TODO: remove deprecated auth adapter
// FIXME: retry flow duplicates requests
```

Use highlighting and the Tag Browser to keep debt visible while coding.

### Migration Tracking

```md
### API Migration

backend/ws/reconnect.ts#20-40

TODO(backend/ws/reconnect.ts#20-40)
```

Navigate directly between notes and implementation ranges.

### Temporary Debugging Sessions

```ts
// HIGHLIGHT: block
if (shouldReconnect) {
  reconnectWebsocket();
}
```

Use temporary visual emphasis during investigations or reviews.

### Shared Documentation Conventions

Use templates to standardize lightweight documentation across teams and repositories.

Especially useful for:

- APIs
- services
- SDKs
- reusable modules
- large codebases

## Troubleshooting

If highlighting or navigation is not working as expected:

| Check                | Description                               |
| -------------------- | ----------------------------------------- |
| Highlighting Enabled | Ensure annotation highlighting is enabled |
| Reload VS Code       | Use `Developer: Reload Window`            |
| Output Logs          | Check `Log (Extension Host)`              |
| Workspace References | Verify referenced paths exist             |
| Highlight Rules      | Ensure tags match configured rules        |

You can also test behavior using a small file with known annotations and references.

## Design Principles

CodeMark+ is designed around a few core ideas:

- annotations should stay lightweight
- references should remain plain text
- workflows should remain editor-native
- files should remain portable and versionable
- navigation should be deterministic
- integrations should remain optional

The extension intentionally avoids becoming:

- a knowledge graph
- a PKM platform
- an AI orchestration system
- a centralized documentation engine
- a mandatory synchronization framework

The goal is simple:

> Keep implementation context visible, navigable, and close to the code.

## Requirements

- Visual Studio Code `^1.102.0`

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
