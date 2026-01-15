# Implementation Plan: VS Code Spec-Kit Status Bar

**Branch**: `001-spec-kit-status-bar` | **Date**: January 13, 2026 | **Spec**: [specs/001-spec-kit-status-bar/spec.md](specs/001-spec-kit-status-bar/spec.md)
**Input**: Feature specification from [specs/001-spec-kit-status-bar/spec.md](specs/001-spec-kit-status-bar/spec.md)

## Summary

- Provide a VS Code extension that surfaces a "🌱" status bar indicator whenever any workspace root includes a `.specify` directory.
- Implement detection via event-driven checks on workspace folders and filesystem changes, avoiding polling to stay performant and compliant with the constitution.
- Deliver developer guidance and contracts so future work can integrate with the status indicator or reuse the detection logic.

## Technical Context

- **Language/Version**: TypeScript 5.x targeting Node 18 (VS Code extension runtime)
- **Primary Dependencies**: `vscode` 1.85+ (status bar API, workspace events), `@vscode/test-electron` with Mocha/Chai for automated tests, ESLint + TypeScript compiler
- **Storage**: N/A (in-memory state only)
- **Testing**: Mocha/Chai via `@vscode/test-electron`, focused unit tests around detection logic plus integration test covering status bar updates
- **Target Platform**: VS Code Desktop (Windows, macOS, Linux)
- **Project Type**: Single VS Code extension package
- **Performance Goals**: Status bar updates within 200ms of workspace or filesystem changes; zero blocking operations on activation
- **Constraints**: Must avoid long-running file scans, handle permission errors gracefully, and keep bundle size minimal for quick activation
- **Scale/Scope**: Single indicator feature shipping within one extension, scoped to handful of source files and companion tests

## Constitution Check (Pre-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| Code Quality | PASS | TypeScript, ESLint, and modular services planned for detection and UI layers. |
| Testing Standards | PASS | Automated unit/integration coverage defined; test harness selected (`@vscode/test-electron`). |
| User Experience Consistency | PASS | Indicator mirrors VS Code status bar guidelines with tooltip messaging. |
| Performance Requirements | PASS | Event-driven detection keeps updates under the 200ms constitution threshold. |

## Phase 0: Outline & Research

- Consolidated best practices for TypeScript VS Code extensions, status bar usage, and filesystem watching in [specs/001-spec-kit-status-bar/research.md](specs/001-spec-kit-status-bar/research.md).
- Resolved all clarifications, including handling multi-root workspaces by showing the indicator if any root contains `.specify`.
- Chosen Yeoman generator and vsce tooling per constitution; no open questions remain.

## Phase 1: Design & Contracts

- **Data Model**: Documented `WorkspaceRoot` tracking and `StatusBarIndicator` state transitions in [specs/001-spec-kit-status-bar/data-model.md](specs/001-spec-kit-status-bar/data-model.md).
- **Contracts**: Captured extension-facing interfaces (indicator state and workspace inspection) in [specs/001-spec-kit-status-bar/contracts/openapi.yaml](specs/001-spec-kit-status-bar/contracts/openapi.yaml) for future automation or telemetry hooks.
- **Quickstart**: Authored [specs/001-spec-kit-status-bar/quickstart.md](specs/001-spec-kit-status-bar/quickstart.md) covering scaffolding, build, testing, and packaging steps.
- **Agent Context**: Updated `.github/agents/copilot-instructions.md` via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` to reflect the latest tech stack and constraints.

## Constitution Check (Post-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| Code Quality | PASS | Design keeps logic modular (workspace service + status UI) and lint-friendly. |
| Testing Standards | PASS | Planned tests cover detection, multi-root toggling, and lifecycle activation/deactivation. |
| User Experience Consistency | PASS | Status bar copy and tooltip defined; no conflicting UI elements introduced. |
| Performance Requirements | PASS | File watching strategy leverages VS Code APIs without custom polling. |

## Project Structure

### Documentation (this feature)

```text
specs/001-spec-kit-status-bar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── openapi.yaml
```

### Source Code (repository root)

```text
extension package root
├── package.json
├── tsconfig.json
├── src/
│   ├── extension.ts          # Activation entry point registering services
│   ├── services/
│   │   ├── statusBarService.ts
│   │   └── specifyDetector.ts
│   └── types/
│       └── index.d.ts
├── src/test/
│   ├── suite/
│   │   └── extension.test.ts
│   └── helpers/
│       └── workspaceFactory.ts
└── out/                      # Compiled JavaScript (gitignored)
```

**Structure Decision**: Single VS Code extension package under the extension workspace, separating services for detection and UI, plus dedicated test utilities.

## Complexity Tracking

No constitution violations identified; table intentionally empty.
