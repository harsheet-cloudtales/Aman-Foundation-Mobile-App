# Aman Foundation Mobile App Constitution

<!-- Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles: none (initial constitution)
- Added sections: Core Principles, Technology Constraints, Development Workflow, Governance
- Removed sections: none
- Templates requiring updates: ✅ [.specify/templates/plan-template.md] (Constitution Check remains generic and compatible)
- Follow-up TODOs: none
-->

## Core Principles

### I. Mission-First Delivery

Every feature or repair must support a real program workflow in the Aman Foundation app,
such as beneficiary management, education services, disaster relief, livelihoods, HR,
or admin oversight. Work that does not improve a user journey or operational process is
not accepted unless it is explicitly justified.

### II. Security and Access Control

Authentication, permissions, and data access must be treated as first-class requirements.
Role-based access must be enforced in both the UI and the API boundary; no screen or action
may expose privileged functionality solely through client-side state.

### III. Type-Safe, Maintainable UI

New screens, components, hooks, and shared utilities in the Expo and React Native codebase
MUST use TypeScript and existing shared patterns. Duplicate state logic, untyped props,
and ad-hoc data handling are not permitted when a shared abstraction already fits.

### IV. Modular Feature Architecture

Features must be organized into focused modules and routed through the existing Expo Router
structure. Shared behavior belongs in reusable components, hooks, or utilities; one-off code
should be isolated rather than copied across modules.

### V. Verified Delivery

Changes MUST be validated before completion. At minimum, changed files must remain free of
ESLint errors and TypeScript errors, and any new or modified workflow must be exercised
through the relevant screen or API path.

## Technology Constraints

The application is built with Expo Router, React Native, TypeScript, and Expo-managed tooling.
New work MUST stay within this stack unless an architectural exception is documented and
approved. API and data access logic should be centralized and consistent with the existing
app structure, and sensitive operations must avoid storing secrets in client-side code.

## Development Workflow

Features MUST be planned around the existing app routes and domain modules before implementation.
Any change to auth, permissions, data models, or cross-module flows requires a short design
note, explicit validation steps, and review against the relevant screen or workflow. Pull
requests must describe the user impact, affected modules, and verification evidence.

## Governance

This constitution supersedes casual shortcuts and unreviewed local conventions. Amendments
require an explicit change to this document, a brief rationale, and review against the affected
workflows or templates. Compliance is checked during planning and review by confirming that
new work preserves these principles, and any deviation requires documented justification.

**Version**: 1.0.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-04
