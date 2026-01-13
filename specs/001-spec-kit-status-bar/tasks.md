# Tasks: VS Code Spec-Kit Status Bar

**Input**: Design documents from specs/001-spec-kit-status-bar/
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the VS Code extension workspace and tooling

- [X] T001 Initialize VS Code extension scaffold with TypeScript template in extensions/spec-kit-status-bar/package.json
- [X] T002 Configure build, lint, and test npm scripts plus dev dependencies in extensions/spec-kit-status-bar/package.json
- [X] T003 [P] Align TypeScript compiler options with project constraints in extensions/spec-kit-status-bar/tsconfig.json


## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core services and test harness required by all stories

- [X] T004 Create SpecKit detector service skeleton exposing workspace scan hooks in extensions/spec-kit-status-bar/src/services/specifyDetector.ts
- [X] T005 Create status bar service skeleton managing emoji item lifecycle in extensions/spec-kit-status-bar/src/services/statusBarService.ts
- [X] T006 Wire activation entry to instantiate foundational services in extensions/spec-kit-status-bar/src/extension.ts
- [X] T007 Provision reusable workspace test helpers for multi-root scenarios in extensions/spec-kit-status-bar/src/test/helpers/workspaceFactory.ts

**Checkpoint**: Core services and test utilities ready for story work


## Phase 3: User Story 1 - See Spec-Kit Status (Priority: P1) 🎯 MVP

**Goal**: Show the "🌱" status bar indicator on startup when any workspace root contains a .specify directory

**Independent Test**: Launch extension with and without a .specify directory and observe status bar state

### Tests for User Story 1

- [X] T008 [P] [US1] Add detector unit tests covering initial workspace scans in extensions/spec-kit-status-bar/src/test/suite/specifyDetector.test.ts
- [X] T009 [P] [US1] Add status bar integration test validating emoji visibility on activation in extensions/spec-kit-status-bar/src/test/suite/statusBarStart.spec.ts

### Implementation for User Story 1

- [X] T010 [US1] Implement initial `.specify` detection across workspace roots in extensions/spec-kit-status-bar/src/services/specifyDetector.ts
- [X] T011 [US1] Implement status bar presentation logic with tooltip copy in extensions/spec-kit-status-bar/src/services/statusBarService.ts
- [X] T012 [US1] Trigger detection during activation and update subscriptions in extensions/spec-kit-status-bar/src/extension.ts

**Checkpoint**: MVP delivers accurate status at startup


## Phase 4: User Story 2 - Dynamic Status Update (Priority: P2)

**Goal**: Update the status bar indicator automatically when the `.specify` directory is added or removed during a session

**Independent Test**: Toggle a `.specify` directory while extension runs and confirm emoji updates without reload

### Tests for User Story 2

- [X] T013 [P] [US2] Extend detector unit tests to cover workspace folder change events in extensions/spec-kit-status-bar/src/test/suite/specifyDetector.test.ts
- [X] T014 [P] [US2] Add dynamic integration test simulating `.specify` create/delete in extensions/spec-kit-status-bar/src/test/suite/statusBarDynamic.spec.ts

### Implementation for User Story 2

- [X] T015 [US2] Handle workspace folder add/remove events to rescan roots in extensions/spec-kit-status-bar/src/services/specifyDetector.ts
- [X] T016 [US2] Register FileSystemWatcher for `.specify` directory changes and emit updates in extensions/spec-kit-status-bar/src/services/specifyDetector.ts
- [X] T017 [US2] Subscribe status bar service to detector notifications and manage disposables in extensions/spec-kit-status-bar/src/services/statusBarService.ts

**Checkpoint**: Indicator stays in sync with real-time workspace changes


## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, packaging, and resiliency touches

- [X] T018 Document status indicator behavior and troubleshooting in extensions/spec-kit-status-bar/README.md
- [X] T019 Harden error handling paths and add logging guards in extensions/spec-kit-status-bar/src/extension.ts
- [X] T020 [P] Validate quickstart by running compile, test, and package workflows in specs/001-spec-kit-status-bar/quickstart.md

---

## Dependencies & Execution Order

- Phase 1 must precede all other work.
- Phase 2 depends on Phase 1 and blocks Phases 3–5.
- Phase 3 (US1) delivers the MVP; complete before Phase 4.
- Phase 4 (US2) builds on US1 event hooks; start after T012.
- Phase 5 depends on Phases 3–4 to document and harden the final experience.

### User Story Dependencies

- US1 depends on Foundational services and provides the MVP.
- US2 depends on US1 detection and status bar flows but remains independently testable once US1 is in place.

### Within-Story Ordering

- Write or update tests (T008–T009, T013–T014) before implementing corresponding logic.
- Complete detector updates before status bar adjustments in each story.

---

## Parallel Execution Examples

- US1: Run T008 and T009 in parallel because they touch separate test files.
- US2: Implement T015 while T014 executes since they operate on distinct files.
- Cross-story: After Phase 2, one developer can progress T010 while another prepares T013.

---

## Implementation Strategy

1. Deliver MVP by finishing Phases 1–3; verify startup detection and status display.
2. Layer dynamic updates via Phase 4 to maintain indicator accuracy without reloads.
3. Conclude with Phase 5 to document, harden, and validate the extension for distribution.
