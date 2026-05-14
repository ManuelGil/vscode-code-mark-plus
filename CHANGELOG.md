# Change Log

All notable changes to the "CodeMark+" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- markdownlint-disable MD024 -->

## [Unreleased]

## [1.8.0] - 2026-05-14

### Added

- Add explicit cleanup scopes to `removeSingleLineComments` for single-line comments.
- Allow cleaning all comments, annotation comments only, or comments matching specific annotation tags.

### Changed

- Update `findSingleLineComments` to identify annotation tags for each detected comment.
- Refine `removeSingleLineComments` to use explicit cleanup scopes instead of implicit filtering behavior.

## [1.7.0] - 2026-05-10

### Changed

- Add `ReplaceAnnotationTag` to `CommandIds` enum
- Implement `replaceAnnotationTagInSelection` method in `CommentController` to replace selected annotation tags within the active editor.
- Introduce `replaceAnnotationTagInActiveFile` method to replace annotation tags across the entire active file.
- Introduce `getAnnotationTagRules` method to retrieve annotation tag rules based on the current language.
- Update extension runtime to register command handlers for replacing annotation tags.

## [1.6.0] - 2026-05-08

### Changed

- Rename the extension to `CodeMark+ - Annotations & Comment Templates` for clearer positioning and improved discoverability
- Refine extension descriptions, keywords, and annotation terminology across the workspace experience
- Standardize annotation and TODO terminology across commands, comments, operations, prompts, and localized UI text
- Rename the default notes directory from `.codemark` to `.code-mark`
- Standardize default note filenames to `todo.md` and `scratchpad.md`
- Improve Tag Browser terminology and navigation flow for a more cohesive annotation workflow
- Enhance the default TODO and Scratchpad templates to provide clearer onboarding and lightweight workspace documentation guidance
- Improve consistency across prompts, placeholders, notifications, and workflow interactions
- Update localization resources to align with the new annotation terminology and workflow naming conventions

## [1.5.0] - 2026-04-30

### Changed

- Convert the extension to a lazy initialization model for heavy features
- Disable intrusive defaults for dynamic highlighting and automatic workspace files

### Fixed

- Remove automatic workspace file creation from startup paths
- Defer Tag Browser provider creation until the view or command is used

## [1.4.0] - 2026-04-29

### Added

- Add cancellation token support and per-file operation timeouts to `TagIndexService` scanning to prevent long-running or hanging scans. Early cancellation checks are performed during loops and batching
- Add `TagIndexService` for scanning and indexing tag occurrences across workspace files
- Introduce `TodoService` for managing TODO-related operations
- Define `TagData`, `TagProfile`, and `TagIndex` interfaces for structured tag management
- Establish extension runtime to initialize services and manage command lifecycle

### Changed

- Broaden `promiseWithTimeout<T>()` helper to accept `PromiseLike<T>` (e.g., VS Code `Thenable`) and normalize via `Promise.resolve()` before racing. This resolves type issues and keeps compatibility with VS Code APIs
- Restore backward-compatible keyword matching in `HighlightController` and `TagIndexService` so keyword-based rules match both `TODO` and `TODO:` in `word` and `substring` modes. Explicit `regex` patterns remain unchanged
- Update configuration descriptions in `package.nls.json` and `package.nls.es.json` to document the flexible keyword matching behavior and clarify that `caseSensitive` defaults to `true`
- Refactor internal structure to decouple TODO-related logic from experimental Notes implementation (Notes was not included in the final release)
- Improve file discovery in `TagBrowserController` using `fast-glob` with POSIX-normalized patterns while preserving existing filters and caching behavior

### Fixed

- Normalize Windows paths in `TagBrowserController` for filename/dirname derivation and depth filtering to ensure correct labels and recursion limits across platforms
- Honor `maxFilesToIndex` after size filtering by backfilling eligible files until the cap is reached, preserving deterministic order

## [1.3.0] - 2025-08-04

### Changed

- Improve error handling and update logic in `CommentController` and `HighlighterController` to provide more informative messages
- Enhance `HighlightController` to limit highlighting on large files and added error handling during keyword parsing
- Refactor `CommentService` to support new languages with appropriate comment templates

## [1.2.0] - 2025-07-18

### Changed

- Improve `HighlightController` to limit highlighting on large files and added error handling during keyword parsing
- Refactor `CommentService` to support new languages with appropriate comment templates
- Enhance `escapeRegExp` function for better regex handling and moved it to a dedicated helper file

## [1.1.1] - 2025-03-09

### Fixed

- Improve localization strings for extension messages

## [1.1.0] - 2025-03-09

### Added

- Add `vscode-marketplace-client` dependency to check for extension updates and display a notification

### Changed

- Improve localization strings for the extension

## [1.0.1] - 2025-03-04

### Fixed

- Fix issue with `useCurrentPosition` setting to insert new comment at cursor position
- Fix typos in the `extension.config.ts` file and `constants.config.ts` file

## [1.0.0] - 2025-03-03

### Added

- Initial release of CodeMark+ extension

[Unreleased]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.8.0...HEAD
[1.8.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ManuelGil/vscode-code-mark-plus/releases/tag/v1.0.0

<!-- markdownlint-enable MD024 -->
