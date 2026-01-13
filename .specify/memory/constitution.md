
<!--
Sync Impact Report
Version change: template → 1.0.0
Modified principles: all (template replaced with concrete)
Added sections: Technology Stack & Tooling, Development Workflow & Quality Gates
Removed sections: None
Templates requiring updates:
	- .specify/templates/plan-template.md ✅ updated (aligned with performance/constraints)
	- .specify/templates/spec-template.md ✅ updated (testing/user stories)
	- .specify/templates/tasks-template.md ✅ updated (test/UX/performance tasks)
	- .specify/templates/commands/*.md ⚠ pending (none found, but check if added)
Follow-up TODOs:
	- TODO(RATIFICATION_DATE): Set original ratification date if known
-->

# Spec Kit VS Code Status Extension Constitution

## Core Principles

### I. Code Quality

All code MUST adhere to strict TypeScript best practices, be idiomatic, and pass linting with no errors or warnings. Code reviews MUST enforce clarity, maintainability, and modularity. Dead code and anti-patterns are not permitted.
Rationale: High code quality ensures maintainability, reduces bugs, and accelerates onboarding.

### II. Testing Standards

All features and bug fixes MUST include automated tests (unit, integration, and UI as appropriate). Test coverage MUST NOT decrease. All tests MUST pass before merging. TDD is strongly encouraged for new features.
Rationale: Rigorous testing prevents regressions and ensures reliable releases.

### III. User Experience Consistency

The extension MUST provide a consistent, intuitive, and accessible user experience aligned with VS Code design guidelines. All UI/UX changes MUST be reviewed for usability and accessibility. User-facing text MUST be clear and actionable.
Rationale: Consistent UX increases user trust and reduces support burden.

### IV. Performance Requirements

The extension MUST not introduce perceptible lag or excessive resource usage. All commands and UI updates MUST complete within 200ms in typical scenarios. Performance regressions MUST be detected and addressed before release.
Rationale: Fast, responsive tools improve user satisfaction and productivity.

## Technology Stack & Tooling

The project MUST use TypeScript for all source code. The Yeoman generator MUST be used for scaffolding. The vsce CLI tool MUST be used for packaging and publishing. All dependencies MUST be reviewed for security and compatibility.

## Development Workflow & Quality Gates

All changes MUST be submitted via pull request and reviewed by at least one maintainer. CI MUST enforce linting, type checks, and all tests. Releases MUST be tagged and changelogs updated. Breaking changes require a MAJOR version bump and migration notes.

## Governance

This constitution supersedes all prior practices. Amendments require documentation, review, and explicit approval by project maintainers. All PRs and reviews MUST verify compliance with these principles. Constitution versioning follows semantic versioning: MAJOR for principle changes, MINOR for new sections, PATCH for clarifications. Compliance is reviewed quarterly.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-01-13
