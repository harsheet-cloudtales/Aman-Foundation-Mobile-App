# Tasks: Local Login Session Persistence

**Input**: Design documents from `/specs/001-local-login-storage/`

**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the app for local auth persistence.

- [x] T001 Create feature planning artifacts in specs/001-local-login-storage/spec.md and specs/001-local-login-storage/plan.md
- [x] T002 [P] Add a local persistence dependency for secure storage in package.json
- [x] T003 [P] Create a local auth storage helper in lib/authStorage.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared auth persistence layer before story work.

- [x] T004 Implement session hydration and persistence wiring in lib/useAuth.ts
- [x] T005 [P] Add startup auth restoration guard in app/\_layout.tsx
- [x] T006 Implement logout and session-clear behavior in lib/useAuth.ts

---

## Phase 3: User Story 1 - Persist login locally without API sharing (Priority: P1) 🎯 MVP

**Goal**: Let the app remember a signed-in session on the device and restore it without sending that session data to the API.

**Independent Test**: Sign in, restart the app, and confirm the user is still authenticated without needing a new login request.

### Implementation for User Story 1

- [x] T007 [US1] Update app/(tabs)/login.tsx to persist the signed-in session locally after a successful login and avoid the API-based session-sharing flow
- [x] T008 [US1] Update app/(tabs)/login.tsx to surface local-storage errors and fallback messaging without exposing credentials
- [x] T009 [US1] Ensure protected screens and routing use the restored local session state from lib/useAuth.ts
- [x] T010 [US1] Clear persisted login data when the user logs out from the auth flow in app/(tabs)/login.tsx or the relevant navigation entry point
- [x] T011 [US1] Add inline documentation in lib/authStorage.ts and lib/useAuth.ts explaining that session data stays local and is not shared with the API

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Harden the user experience around local session persistence.

- [x] T012 [P] Review and refine auth error handling in app/(tabs)/login.tsx and lib/useAuth.ts
- [x] T013 [P] Update README.md with a short note about local session persistence behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): No dependencies
- Foundational (Phase 2): Depends on Setup completion and blocks User Story 1
- User Story 1 (Phase 3): Depends on Foundational completion
- Polish (Phase 4): Depends on User Story 1 completion

### Parallel Opportunities

- T002 and T003 can run in parallel
- T005 and T006 can run in parallel after T004 is in place
- T012 and T013 can run in parallel after the story is complete

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 for User Story 1
3. Validate the sign-in, restart, and logout flow end-to-end

### Incremental Delivery

1. Add the storage wrapper and auth hydration layer
2. Wire the login and logout flows to the local session store
3. Hardening and documentation follow once the story works independently
