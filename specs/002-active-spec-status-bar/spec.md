
# Feature Specification: Active Spec Status Bar

**Feature Branch**: `002-active-spec-status-bar`  
**Created**: January 15, 2026  
**Status**: Draft  
**Input**: User description: "Once the extension is active, view spec/001-spec-kit-status-bar, detect if a specific spec is 'active' and place the name of the spec after the '🌱' emoji in the status bar."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Show Active Spec in Status Bar (Priority: P1)

As a developer using the Spec-Kit VS Code extension, I want to see the name of the currently active spec displayed after the "🌱" emoji in the status bar, so I can quickly identify which spec is being worked on or is currently relevant.

**Why this priority**: This provides immediate, visible feedback about the active spec context, improving awareness and workflow for users working with multiple specs.

**Independent Test**: Can be fully tested by activating the extension, ensuring a spec is marked as active, and observing the status bar for the "🌱" emoji followed by the active spec name (e.g., "🌱 001-spec-kit-status-bar").

**Acceptance Scenarios**:

1. **Given** the extension is active and a spec is detected as active, **When** the user views the status bar, **Then** the status bar displays the "🌱" emoji followed by the active spec name.
2. **Given** the extension is active and no spec is active, **When** the user views the status bar, **Then** the status bar displays only the "🌱" emoji or hides the spec name.

---

### User Story 2 - Update Status Bar on Active Spec Change (Priority: P2)

As a developer, I want the status bar to update automatically if the active spec changes while the extension is running, so the indicator always reflects the current active spec.

**Why this priority**: Ensures the indicator is always accurate, even as the active spec context changes during a session.

**Independent Test**: Can be fully tested by changing the active spec and observing the status bar update accordingly.

**Acceptance Scenarios**:

1. **Given** a spec is currently active, **When** the active spec changes, **Then** the status bar updates to show the new active spec name after the emoji.
2. **Given** no spec is active, **When** a spec becomes active, **Then** the status bar updates to show the emoji and the new active spec name.

---

### Edge Cases

- If there is ambiguity about which spec is active (e.g., multiple candidates), the extension should use a clear default or prompt the user.
- If the active spec cannot be determined, the status bar should not display a spec name.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a "🌱" emoji in the VS Code status bar when the extension is active.
- **FR-002**: The system MUST detect if a specific spec is "active" and display the name of the active spec after the emoji in the status bar (e.g., "🌱 001-spec-kit-status-bar").
- **FR-003**: The system MUST update the status bar indicator in real time if the active spec changes while VS Code is running.
- **FR-004**: The system MUST handle cases where no spec is active by displaying only the emoji or hiding the spec name.
- **FR-005**: The system MUST handle ambiguity or errors in determining the active spec gracefully, providing a fallback or silent failure without crashing.

### Key Entities

- **Status Bar Indicator**: The visual element in the VS Code status bar that displays the "🌱" emoji and, if present, the active spec name.
- **Active Spec**: The currently detected spec considered "active" by the extension, whose name is shown after the emoji.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users with an active spec see the "🌱" emoji and the active spec name in the status bar within 5 seconds of activation or spec change.
- **SC-002**: 100% of users with no active spec see only the emoji or no spec name in the status bar.
- **SC-003**: Status bar indicator updates within 3 seconds of the active spec changing.
- **SC-004**: No user reports of VS Code crashing or freezing due to this extension.

## Assumptions

- There is a reliable way to determine which spec is "active" (e.g., user selection, convention, or most recently modified).
- Users may change the active spec at any time during a session.
- The extension should not require any configuration to function as described.

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
