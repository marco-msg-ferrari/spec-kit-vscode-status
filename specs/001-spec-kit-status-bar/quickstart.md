# Quickstart: VS Code Spec-Kit Status Bar Extension

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- VS Code (latest stable)
- Yeoman and VS Code Extension Generator: `npm install -g yo generator-code`
- vsce for packaging: `npm install -g vsce`

## Setup

1. Scaffold the extension:

   ```sh
   yo code
   # Choose TypeScript, name: spec-kit-status-bar
   ```

2. Copy or implement the logic as per the data model and API contract.
3. Install dependencies:

   ```sh
   npm install
   ```

4. Build and run the extension:

   ```sh
   npm run compile
   code .
   # Press F5 to launch Extension Development Host
   ```

## Testing

- Add/remove `.specify` directory in any workspace root and verify the status bar emoji updates.
- Run tests:

   ```sh
   npm test
   ```

## Packaging

- To package for VS Code Marketplace:

   ```sh
   vsce package
   ```

## Reference

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Spec-Kit Project](https://github.com/github/spec-kit)
