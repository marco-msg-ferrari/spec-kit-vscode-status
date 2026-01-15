# Spec-Kit Status Bar

The Spec-Kit Status Bar extension surfaces a "🌱" indicator whenever the current VS Code workspace contains a `.specify` directory in any root folder. When an active Spec-Kit feature branch is detected, the indicator appends the spec name (for example, `🌱 002-active-spec-status-bar`). The indicator hides automatically when Spec-Kit is not detected.

## Features

- Displays a "🌱" emoji in the status bar as soon as the extension detects a `.specify` directory in any workspace root.
- Shows the active spec name after the emoji whenever `SPECIFY_FEATURE`, the current git branch, or a fallback spec directory identifies an active spec.
- Reacts to workspace changes in real time—adding or removing the `.specify` directory updates the indicator within moments without reloading VS Code.
- Updates automatically when the active spec changes (for example, after checking out a different git branch or updating `SPECIFY_FEATURE`).
- Handles multi-root workspaces by showing the indicator if any root contains `.specify`.
- Fails gracefully if file system access is restricted, keeping VS Code stable.

## Usage

1. Install the extension locally (see Development below) or from a package once published.
2. Open a folder or multi-root workspace in VS Code.
3. Ensure a `.specify` directory exists in at least one workspace root.
4. (Optional) Set the `SPECIFY_FEATURE` environment variable or check out a feature branch that matches a spec directory (for example, `002-active-spec-status-bar`).
5. Look for the "🌱" emoji in the status bar. When an active spec resolves, the spec name appears after the emoji.
6. Remove the `.specify` directory to hide the indicator.

## Development

```bash
# Install dependencies
npm install

# Build the extension
npm run compile

# Launch Extension Development Host
code .
# Press F5 to start debugging session

# Run tests
npm test

# Package the extension
npm run package
```

## Troubleshooting

- If the indicator does not appear, confirm that the `.specify` directory exists at the root of the workspace (not nested).
- If the emoji appears without a spec name, verify that `SPECIFY_FEATURE` is set, the current git branch matches a spec directory, or the desired spec exists under `specs/`.
- Ensure the extension has been compiled (`npm run compile`) before running tests or launching the dev host.
