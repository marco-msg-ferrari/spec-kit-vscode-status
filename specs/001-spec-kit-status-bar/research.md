# Research for VS Code Spec-Kit Status Bar Extension

## Decision: Use TypeScript and VS Code Extension API

- **Rationale**: The VS Code extension ecosystem is built around TypeScript and the official VS Code Extension API. This ensures compatibility, maintainability, and access to all required status bar and workspace APIs.
- **Alternatives considered**: JavaScript (less type safety), other languages (require transpilation, less community support).

## Decision: Detect Spec-Kit by presence of `.specify` directory in any workspace root

- **Rationale**: This is the most reliable and user-friendly way to detect Spec-Kit usage, as per the feature spec and clarified requirements.
- **Alternatives considered**: Looking for specific files, checking for package dependencies, or requiring user configuration (all less robust or more error-prone).

## Decision: Use VS Code's `workspace.onDidChangeWorkspaceFolders` and `FileSystemWatcher` for dynamic updates

- **Rationale**: These APIs allow the extension to respond to changes in workspace structure and file system in real time, ensuring the status bar indicator is always accurate.
- **Alternatives considered**: Polling the file system (less efficient), only checking on startup (not dynamic).

## Decision: Show the emoji if any workspace root contains `.specify`

- **Rationale**: This is the clarified requirement and provides the most inclusive user experience.
- **Alternatives considered**: Only showing if all roots have `.specify` (less discoverable), showing a warning for mixed state (more complex, not required).

## Decision: Handle file system errors gracefully

- **Rationale**: Prevents crashes and ensures a smooth user experience even if there are permission or access issues.
- **Alternatives considered**: Failing loudly (bad UX), ignoring errors (may hide real issues).

## Decision: Use Yeoman generator and vsce for scaffolding and packaging

- **Rationale**: Aligns with project constitution and best practices for VS Code extension development.
- **Alternatives considered**: Manual setup (slower, more error-prone).
