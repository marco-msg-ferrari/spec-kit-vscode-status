# Quickstart: Active Spec Status Bar

## Prerequisites

- Node.js 18+
- npm 9+
- VS Code (latest stable)
- Yeoman + VS Code Extension generator: `npm install -g yo generator-code`
- vsce for packaging: `npm install -g vsce`

## Setup

1. Scaffold or reuse the existing Spec-Kit status extension source under `src/`.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Build the extension:

   ```sh
   npm run compile
   ```

4. Launch the extension host from VS Code (Run → Start Debugging or `F5`).

## Verification

1. Open a workspace containing a `.specify` directory.
2. Ensure the `SPECIFY_FEATURE` environment variable matches an existing spec folder (e.g., `002-active-spec-status-bar`) **or** switch Git branches to the desired feature branch.
3. Observe the status bar:
   - When Spec-Kit is detected and an active spec resolves, the text should read `🌱 <specName>`.
   - When no active spec is found, the indicator shows only `🌱`.
4. Switch to a different feature branch (or update `SPECIFY_FEATURE`) and confirm the status bar updates within a couple seconds.

## Testing

- Run automated tests:

  ```sh
  npm test
  ```

- Write integration tests that simulate Git branch changes using the VS Code testing harness to ensure the status text refreshes correctly.

## Packaging

- Package for distribution:

  ```sh
  vsce package
  ```

## References

- [VS Code Git Extension API](https://code.visualstudio.com/api/extension-guides/git)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Spec-Kit Project](https://github.com/github/spec-kit)
