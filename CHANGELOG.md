# Change Log

All notable changes to the "CodeMark+" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- Initial release of codeMark+ extension

[Unreleased]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/ManuelGil/vscode-code-mark-plus/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/ManuelGil/vscode-code-mark-plus/releases/tag/v1.0.0
