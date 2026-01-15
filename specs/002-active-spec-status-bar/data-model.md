# Data Model for Active Spec Status Bar

## Entities

### WorkspaceRootStatus

- **Attributes**:
  - `uri`: VS Code workspace folder URI
  - `hasSpecify`: boolean flag indicating whether the root contains a `.specify` directory

### SpecKitStatus

- **Attributes**:
  - `anyRootHasSpecify`: boolean indicating whether any workspace root has `.specify`
  - `roots`: array of `WorkspaceRootStatus`

### ActiveSpecState

- **Attributes**:
  - `specName`: string containing the resolved spec identifier (e.g., `002-active-spec-status-bar`)
  - `source`: enum of `env`, `git`, or `fallback`, describing how the spec name was determined
  - `specExists`: boolean indicating whether `specs/<specName>/spec.md` exists
  - `timestamp`: Date captured when the value was resolved (used to avoid stale comparisons)

### StatusBarViewModel

- **Attributes**:
  - `text`: string shown in the status bar item ("🌱" or "🌱 <specName>")
  - `tooltip`: string explaining the current state (e.g., "Spec-Kit detected: 002-active-spec-status-bar")
  - `visible`: boolean controlling whether the status bar item is revealed

## Relationships

- `SpecKitDetector` produces `SpecKitStatus` events that drive downstream updates.
- The `ActiveSpecResolver` consumes environment variables, Git state, and the filesystem to produce an `ActiveSpecState`.
- The `StatusBarService` combines `SpecKitStatus` and `ActiveSpecState` into a `StatusBarViewModel` for rendering.

## Validation Rules

- When `SpecKitStatus.anyRootHasSpecify` is `false`, `StatusBarViewModel.visible` must be `false` regardless of `ActiveSpecState`.
- When `SpecKitStatus.anyRootHasSpecify` is `true`:
  - If `ActiveSpecState.specName` is defined and `ActiveSpecState.specExists` is `true`, set `text` to "🌱 <specName>" and show the item.
  - If the spec name is missing or the spec does not exist, set `text` to "🌱" and show the item.
- `ActiveSpecState.timestamp` is used to deduplicate updates; newer timestamps replace older state.
- Failures resolving the active spec (e.g., Git extension unavailable) should produce an `ActiveSpecState` with `specName = undefined` and `specExists = false` without throwing errors.

## State Transitions

1. **Initialization**
   - `SpecKitDetector.initialize()` emits the current `SpecKitStatus`.
   - `ActiveSpecResolver.refresh()` computes the initial `ActiveSpecState`.
2. **Workspace Change**
   - When `.specify` presence toggles, recompute `StatusBarViewModel` immediately.
3. **Active Spec Change**
   - Triggered by Git branch events, `SPECIFY_FEATURE` overrides, or fallback recalculation; recompute `ActiveSpecState` and update the status bar text.
4. **Error Handling**
   - Any failure in filesystem or Git access logs a warning and defaults to emoji-only display without surfacing errors to users.
