# Tasks: Active Spec Status Bar

**Input**: Design documents from specs/002-active-spec-status-bar/
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the extension workspace and tooling for active spec support

- [ ] T001 Create ActiveSpecResolver utility in src/services/activeSpecResolver.ts
- [ ] T002 [P] Add unit test skeleton for ActiveSpecResolver in src/test/suite/activeSpecResolver.test.ts
- [ ] T003 Update extension manifest and README for new feature in package.json and README.md

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish core detection, resolver, and test harness required by all stories

- [ ] T004 Integrate ActiveSpecResolver with SpecKitDetector in src/extension.ts
- [ ] T005 [P] Add integration test skeleton for status bar spec name in src/test/suite/statusBarActiveSpec.spec.ts

**Checkpoint**: Core resolver and test utilities ready for story work

## Phase 3: User Story 1 - Show Active Spec in Status Bar (Priority: P1) 🎯 MVP

**Goal**: Show the "🌱" status bar indicator with the active spec name when detected

**Independent Test**: Launch extension with a .specify directory and active spec, observe status bar for "🌱 <specName>"

### Tests for User Story 1

- [ ] T006 [P] [US1] Add unit tests for spec resolution logic in src/test/suite/activeSpecResolver.test.ts
- [ ] T007 [P] [US1] Add integration test for status bar text in src/test/suite/statusBarActiveSpec.spec.ts

### Implementation for User Story 1

- [ ] T008 [US1] Implement ActiveSpecResolver logic in src/services/activeSpecResolver.ts
- [ ] T009 [US1] Update StatusBarService to append active spec name in src/services/statusBarService.ts
- [ ] T010 [US1] Wire resolver and status bar update in src/extension.ts

**Checkpoint**: MVP delivers accurate status bar with active spec name

## Phase 4: User Story 2 - Update Status Bar on Active Spec Change (Priority: P2)

**Goal**: Update the status bar indicator automatically when the active spec changes

**Independent Test**: Change active spec (branch or env), observe status bar update within 3 seconds

### Tests for User Story 2

- [ ] T011 [P] [US2] Add integration test for dynamic spec change in src/test/suite/statusBarActiveSpecDynamic.spec.ts

### Implementation for User Story 2

- [ ] T012 [US2] Subscribe to Git extension events and SPECIFY_FEATURE env changes in src/services/activeSpecResolver.ts
- [ ] T013 [US2] Update status bar on resolver events in src/services/statusBarService.ts

**Checkpoint**: Indicator stays in sync with real-time active spec changes

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, packaging, and resiliency touches

- [ ] T014 Document active spec behavior and troubleshooting in README.md
- [ ] T015 Harden error handling and add logging guards in src/services/activeSpecResolver.ts
- [ ] T016 [P] Validate quickstart by running compile, test, and package workflows in specs/002-active-spec-status-bar/quickstart.md

---

## Dependencies & Execution Order

- Phase 1 must precede all other work.
- Phase 2 depends on Phase 1 and blocks Phases 3–5.
- Phase 3 (US1) delivers the MVP; complete before Phase 4.
- Phase 4 (US2) builds on US1 event hooks; start after T010.
- Phase 5 depends on Phases 3–4 to document and harden the final experience.

### User Story Dependencies

- US1 depends on Foundational services and provides the MVP.
- US2 depends on US1 detection and status bar flows but remains independently testable once US1 is in place.

### Within-Story Ordering

- Write or update tests (T006–T007, T011) before implementing corresponding logic.
- Complete resolver updates before status bar adjustments in each story.

---

## Parallel Execution Examples

- US1: Run T006 and T007 in parallel because they touch separate test files.
- US2: Implement T012 while T011 executes since they operate on distinct files.
- Cross-story: After Phase 2, one developer can progress T008 while another prepares T011.

---

## Implementation Strategy

1. Deliver MVP by finishing Phases 1–3; verify status bar with active spec name.
2. Layer dynamic updates via Phase 4 to maintain indicator accuracy without reloads.
3. Conclude with Phase 5 to document, harden, and validate the extension for distribution.
