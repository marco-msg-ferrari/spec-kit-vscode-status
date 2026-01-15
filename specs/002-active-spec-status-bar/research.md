# Research for Active Spec Status Bar

## Decision: Resolve active spec name via SPECIFY_FEATURE override, git branch, then latest spec fallback

- **Rationale**: Spec Kit workflows already export `SPECIFY_FEATURE` in automation scripts and align feature branches/dirs to the `###-short-name` convention. Reading the environment variable first respects explicit overrides, git HEAD ensures accurate status during normal development, and falling back to the highest-numbered spec directory covers non-git or detached HEAD scenarios.
- **Alternatives considered**: Prompting the user for the active spec (creates friction), scanning open editors for spec files (fragile), or requiring manual configuration (high maintenance).

## Decision: Use vscode.git extension API to observe branch changes in real time

- **Rationale**: The built-in Git extension publishes a stable API (`GitExtension`) that surfaces repository state, including `repository.state.HEAD` details and an `onDidChangeState` event that fires on branch or HEAD changes. Subscribing to these events lets the status bar refresh within the 200ms performance target without polling.
- **Alternatives considered**: Running `git status` via the shell (blocking, error-prone), polling the filesystem for `.git/HEAD` (inefficient), or relying on workspace `onDidChangeConfiguration` (indirect, misses CLI branch changes).

## Decision: Display spec name only when both Spec-Kit is detected and active spec resolution succeeds

- **Rationale**: Maintaining the existing "🌱" behavior for workspaces lacking Spec-Kit or any discernible active spec keeps UX predictable. Only appending the spec name when all requirements are met avoids misleading or partial data.
- **Alternatives considered**: Always showing the last resolved spec name (stale/incorrect), or hiding the emoji entirely when active spec is unknown (violates original MVP behavior).

## Decision: Validate active spec directory existence to guard against stale branches

- **Rationale**: Checking that `specs/<active-spec>/spec.md` exists protects against branch naming drift or deleted specs, aligning with graceful-degradation requirements. If the spec content is missing, the service falls back to showing just the emoji.
- **Alternatives considered**: Trusting branch naming blindly (risks broken links), or scanning every spec directory at runtime (unnecessary I/O).
