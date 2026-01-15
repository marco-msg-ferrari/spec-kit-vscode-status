# Implementation Plan: Active Spec Status Bar

**Branch**: `002-active-spec-status-bar` | **Date**: January 15, 2026 | **Spec**: [specs/002-active-spec-status-bar/spec.md](specs/002-active-spec-status-bar/spec.md)
**Input**: Feature specification from [specs/002-active-spec-status-bar/spec.md](specs/002-active-spec-status-bar/spec.md)

## Summary

- Extend the existing Spec-Kit status indicator so that, when a workspace root contains a `.specify` directory, the status bar shows "🌱" followed by the currently active spec name.
- Detect the active spec by observing the current feature branch (or SPECIFY_FEATURE override) and mapping it to the corresponding spec directory.
- Refresh the indicator in near real time when the active spec changes (e.g., branch checkout) while keeping the solution performant and resilient.

## Technical Context

- **Language/Version**: TypeScript 5.x targeting Node 18 (VS Code extension runtime)
- **Primary Dependencies**: `vscode` 1.85+ (status bar, workspace, Git extension API), `@vscode/test-electron` with Mocha/Chai for automated tests, ESLint + TypeScript compiler
- **Storage**: N/A (in-memory state only)
- **Testing**: Mocha/Chai via `@vscode/test-electron`, unit tests for detection logic, integration tests verifying status bar updates
- **Target Platform**: VS Code Desktop (Windows, macOS, Linux)
- **Project Type**: Single VS Code extension package
- **Performance Goals**: Status bar updates within 200ms of workspace or active spec changes; zero blocking operations on activation
- **Constraints**: Must avoid long-running file scans, rely on VS Code events, handle permission or Git errors gracefully, and keep bundle size minimal for quick activation
- **Scale/Scope**: Single indicator enhancement within existing extension footprint

## Constitution Check (Pre-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| Code Quality | PASS | Leverage existing modular services with additional helpers for active spec resolution. |
| Testing Standards | PASS | Plan for unit coverage on spec resolution and integration verification of status text updates. |
| User Experience Consistency | PASS | Status item mirrors VS Code status bar guidance and extends existing emoji indicator. |
| Performance Requirements | PASS | Event-driven updates (Git API + workspace watchers) maintain sub-200ms response. |

## Phase 0: Outline & Research

- Documented active spec resolution strategy and Git branch listener approach in [specs/002-active-spec-status-bar/research.md](specs/002-active-spec-status-bar/research.md).
- Clarified fallback behavior when the spec directory is missing or Spec-Kit is absent, ensuring the status bar degrades to the emoji-only state.

## Phase 1: Design & Contracts

- **Data Model**: Captured workspace detection, active spec resolution, and status bar presentation flow in [specs/002-active-spec-status-bar/data-model.md](specs/002-active-spec-status-bar/data-model.md).
- **Contracts**: Defined status, active spec, and workspace inspection endpoints in [specs/002-active-spec-status-bar/contracts/openapi.yaml](specs/002-active-spec-status-bar/contracts/openapi.yaml).
- **Quickstart**: Documented setup, verification, and packaging steps in [specs/002-active-spec-status-bar/quickstart.md](specs/002-active-spec-status-bar/quickstart.md).
- **Agent Context**: Refreshed `.github/agents/copilot-instructions.md` via `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`.

## Constitution Check (Post-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| Code Quality | PASS | Design maintains separation of detector, resolver, and presentation layers with clear contracts. |
| Testing Standards | PASS | Plan includes unit coverage for resolver logic plus integration coverage for status updates. |
| User Experience Consistency | PASS | Status bar copy remains concise; spec name appears only when reliable. |
| Performance Requirements | PASS | Event-driven Git API usage and filesystem checks avoid polling and meet 200ms target. |

## Project Structure

### Documentation (this feature)

```text
specs/002-active-spec-status-bar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── extension.ts
├── services/
│   ├── specifyDetector.ts
│   └── statusBarService.ts
├── test/
│   ├── helpers/
│   └── suite/
└── types/
```

**Structure Decision**: Single VS Code extension package rooted at src/, continuing the detector + status bar service composition with dedicated tests.

## Complexity Tracking

No constitution violations identified; section reserved for future updates if needed.
