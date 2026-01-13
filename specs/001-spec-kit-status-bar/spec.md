
# Feature Specification: VS Code Spec-Kit Status Bar

**Feature Branch**: `001-spec-kit-status-bar`
**Created**: January 13, 2026
**Status**: Draft
**Input**: User description: "Create a VS Code extension that shows the '🌱' emoji in the status bar if detects that <https://github.com/github/spec-kit> is in use in the project. The detection MUST be based on the presence of the '.specify' directory in the root of the project."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Spec-Kit Status (Priority: P1)

As a developer working in VS Code, I want to see a clear indicator in the status bar when my project uses Spec-Kit (detected by the presence of a `.specify` directory), so I can quickly confirm that Spec-Kit features are available in my workspace.

**Why this priority**: This is the core value proposition—providing immediate, visible feedback to users about Spec-Kit presence.

**Independent Test**: Can be fully tested by opening a project with and without a `.specify` directory and observing the status bar for the "🌱" emoji.

**Acceptance Scenarios**:

1. **Given** a project with a `.specify` directory in the root, **When** the workspace is opened in VS Code, **Then** the status bar displays the "🌱" emoji.
2. **Given** a project without a `.specify` directory in the root, **When** the workspace is opened in VS Code, **Then** the status bar does not display the "🌱" emoji.

---

### User Story 2 - Dynamic Status Update (Priority: P2)

As a developer, I want the status bar indicator to update automatically if the `.specify` directory is added or removed while VS Code is open, so the indicator always reflects the current state of the project.

**Why this priority**: Ensures the indicator is always accurate, even as the project structure changes during a session.

**Independent Test**: Can be fully tested by adding or removing the `.specify` directory while VS Code is running and observing the status bar update accordingly.

**Acceptance Scenarios**:

1. **Given** a project without a `.specify` directory, **When** the directory is created, **Then** the status bar updates to show the "🌱" emoji.
2. **Given** a project with a `.specify` directory, **When** the directory is deleted, **Then** the status bar updates to remove the "🌱" emoji.

---

### Edge Cases

- If the workspace contains multiple root folders, and at least one has a `.specify` directory, the indicator shows the "🌱" emoji. If none have `.specify`, the indicator is hidden.
- How does the system handle permission errors when accessing the file system?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a "🌱" emoji in the VS Code status bar when a `.specify` directory exists in the root of the workspace.
- **FR-002**: The system MUST NOT display the emoji if the `.specify` directory is absent from the root of the workspace.
- **FR-003**: The system MUST update the status bar indicator in real time if the `.specify` directory is added or removed while VS Code is running.
-- **FR-004**: The system MUST handle multiple workspace roots and display the emoji if any root contains a `.specify` directory.
- **FR-005**: The system MUST handle file system access errors gracefully, providing a fallback or silent failure without crashing.

### Key Entities

- **Workspace Root**: The top-level folder(s) opened in VS Code, which may or may not contain a `.specify` directory.
- **Status Bar Indicator**: The visual element in the VS Code status bar that displays the "🌱" emoji if Spec-Kit is detected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users with a `.specify` directory in their workspace root see the "🌱" emoji in the status bar within 5 seconds of opening the project.
- **SC-002**: 100% of users without a `.specify` directory in their workspace root do not see the emoji in the status bar.
- **SC-003**: Status bar indicator updates within 3 seconds of adding or removing the `.specify` directory.
- **SC-004**: No user reports of VS Code crashing or freezing due to this extension.

## Assumptions

- The presence of the `.specify` directory is a reliable indicator that Spec-Kit is in use.
- Users may add or remove the `.specify` directory at any time during a session.
- The extension should not require any configuration to function as described.
