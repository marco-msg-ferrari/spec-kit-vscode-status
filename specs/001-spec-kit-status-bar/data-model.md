# Data Model for VS Code Spec-Kit Status Bar Extension

## Entities

### WorkspaceRoot

- **Attributes**:
  - `uri`: URI of the root folder
  - `hasSpecify`: boolean (true if `.specify` directory exists in this root)

### StatusBarIndicator

- **Attributes**:
  - `visible`: boolean (true if indicator is shown)
  - `emoji`: string (always "🌱")
  - `tooltip`: string (e.g., "Spec-Kit detected in this workspace")

## Relationships

- The extension maintains a list of `WorkspaceRoot` entities, one for each root folder in the workspace.
- The `StatusBarIndicator` is visible if any `WorkspaceRoot.hasSpecify` is true.

## Validation Rules

- On startup and whenever workspace folders or file system state changes, check each root for `.specify`.
- If any root has `.specify`, set `StatusBarIndicator.visible = true`; otherwise, set to false.
- Handle file system errors gracefully (do not crash, optionally log or show a warning).
