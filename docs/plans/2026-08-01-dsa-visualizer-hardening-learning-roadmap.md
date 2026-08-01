---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: repository-review-2026-08-01
execution: code
title: DSA Visualizer hardening, learning loop, guided execution, and scale roadmap
date: 2026-08-01
---

# DSA Visualizer hardening, learning loop, guided execution, and scale roadmap

## Goal Capsule

### Objective

Make the DSA Visualizer safe to use, trustworthy as a learning product, and ready to grow from a portfolio project into a reliable public application. Work proceeds through four dependent sprints: security and correctness, learning loop, guided step mode, then scale and quality.

### Authority and stop conditions

- The Product Contract below defines user-visible behavior.
- The Planning Contract defines implementation choices unless a requirement forces a change.
- Existing repository conventions and the user's later direction override this document when they conflict.
- Stop and surface a blocker if a change would require a new paid infrastructure dependency, expose hidden solution data, weaken authorization, or change the public API without a migration path.
- Do not commit local secrets or `backend/src/main/resources/application-local.properties`.

### Tail ownership

The integrating agent owns cross-unit conflict resolution, final cleanup, verification, and the final handoff. Worker agents must keep changes scoped to their assigned unit and must not revert unrelated work in the shared checkout.

## Product Contract

### Summary

The application lets users explore data structures, practice problems, submit code, and track progress. The current foundation is strong visually, but several paths trust client-provided state, expose sensitive fields, call an external execution service without enough protection, and do not persist the learning loop. The roadmap preserves the current visual identity while fixing those risks and adding a differentiated guided execution mode.

### Problem Frame

- Password reset can reach the password-change action without a server-side proof that OTP verification succeeded.
- Code execution is publicly reachable, lacks strong input and quota controls, and blocks while making one external request per test case.
- A client can submit `passed: true` and mark progress without a server-authoritative execution result.
- Public problem responses include reference solution fields.
- Settings appear to save locally because no profile update endpoint exists.
- Progress is mostly topic-level and does not support attempts, drafts, resume, or meaningful time tracking.
- The frontend ships a large eager bundle and uses multiple API clients with conflicting environment behavior.
- Automated coverage is thin: one backend test and no frontend or browser test suite.

### Requirements

| ID | Requirement | Acceptance signal |
|---|---|---|
| R1 | Password reset must require a short-lived, one-time server-issued reset proof created only after valid OTP verification. | A password change with a missing, expired, reused, or mismatched proof returns a safe client error and does not modify the account; the opaque proof is returned only in an HTTPS response body. |
| R2 | Password reset and verification endpoints must not reveal whether an email exists and must have abuse controls. | Unknown-email and known-email responses are equivalent; reset requests and wrong OTP attempts are throttled per challenge/email/IP, challenges are invalidated after the failure limit, and logs contain no proof, OTP, or email secret. |
| R3 | Code execution must enforce authentication, validate language/code/problem input, enforce timeouts, output/concurrency/provider-budget limits, and return typed failure states. | Unauthorized or oversized requests fail before Judge0; timeout, compile error, runtime error, quota, and provider failures are distinguishable and admission fails closed when the limiter/provider circuit is unavailable. |
| R4 | Progress completion must be derived from a server-authoritative, unforgeable execution receipt, not a client boolean. | Directly posting `passed: true` cannot complete a problem; a receipt bound to the server test-set version can complete the matching problem once and cannot be replayed or transferred. |
| R5 | Public problem payloads must exclude reference solution code and hidden evaluation data. | Public API serialization has no solution fields; this roadmap does not add a solution reveal endpoint. |
| R6 | Authenticated users can update profile data through a validated backend endpoint. | Settings changes persist after reload and enforce the selected email-verification policy. |
| R7 | Users can resume practice with per-problem progress, drafts, attempts, completion, time, and best-result data. | Refreshing or returning to a problem restores its state and the dashboard reflects real activity. |
| R8 | Practice discovery must support useful filtering and status feedback. | Users can filter by difficulty/tag/solved state and see attempt or completion status. |
| R9 | Guided step mode must synchronize an algorithm trace, visual state, code line, explanation, and accessible controls. | A supported algorithm can step forward/back, play/pause, and show the corresponding state without relying on animation alone. |
| R10 | The client must use one API/environment strategy and reduce avoidable initial JavaScript. | Route and editor loading are deferred, API base behavior is consistent in dev/prod, and the production bundle meets the agreed budget. |
| R11 | Persistence, errors, logs, and operational checks must be production-safe. | Schema changes are versioned, safe error envelopes are used, production logging is not DEBUG, and health/readiness behavior is documented. |
| R12 | The project must have repeatable quality gates. | Backend tests, frontend checks/build, focused integration tests, accessibility checks, and browser smoke flows run locally and in CI. |

### Actors and key flows

1. A visitor explores a visualization. Guest code execution is future scope; Sprint 1 requires authentication.
2. An authenticated learner opens a problem, edits a draft, runs code, submits, and receives a server-verified result.
3. The learner returns later and resumes the draft, sees attempts, and reviews progress.
4. A learner requests a password reset, verifies OTP, receives a one-time reset proof, and changes the password.
5. A maintainer deploys the app, checks health/readiness, and receives actionable provider errors without secret leakage.

### Scope boundaries

In scope: the existing Spring Boot API, React client, Judge0 integration, authentication boundaries, progress persistence, practice UX, guided step mode for a small first algorithm set, bundle/test/CI cleanup, and documentation needed to operate the result.

Out of scope for this roadmap: replacing Judge0, building a multi-tenant admin console, adding a new billing system, implementing every algorithm in guided mode, changing the visual brand, or guaranteeing zero-cost hosting. These can follow the quality foundations.

### Success criteria

- No unauthenticated path can reset an account, consume unlimited execution capacity, or mark a problem complete.
- Public problem responses contain no reference solution code.
- A learner can complete and resume a practice flow with persisted evidence.
- Guided mode works for at least two representative algorithms and is keyboard/reduced-motion accessible.
- Production client initial JavaScript is at most 700 kB uncompressed for the main entry chunk, with Monaco excluded from the initial route where possible.
- `mvn test`, `npm run check`, `npm run build`, focused integration tests, and browser smoke tests pass in CI.

### Non-blocking open questions

- The initial authenticated execution policy is the default. A bounded guest allowance can be added later without changing the server-authoritative result contract.
- Email change may require re-verification rather than immediate replacement. Preserve the current email until the policy is implemented and tested.
- Use the existing database during the first migration pass. Do not add a new database vendor as part of this roadmap.

## Planning Contract

### Key technical decisions

| ID | Decision | Rationale |
|---|---|---|
| KTD1 | Keep Judge0 behind `CodeExecutionService`; treat provider output as a transient typed execution result and issue a separate persisted opaque receipt only for a passing result. | The client should not depend on RapidAPI response details, and progress must consume a trusted server result. |
| KTD2 | Treat reset proof as a hashed, server-side, single-use credential with expiry, purpose binding, user binding, and HTTPS-response-body-only transport. | OTP verification must create evidence that cannot be reconstructed from an email and request body, and bearer-proof leakage must be minimized. |
| KTD3 | Add DTO boundaries instead of returning JPA entities from public controllers. | This removes solution leakage and makes future schema changes safer. |
| KTD4 | Introduce a versioned persistence path for new progress/attempt data before changing runtime behavior. | Existing `ddl-auto=update` and seed-on-empty behavior are unsafe for evolving production data. |
| KTD5 | Use one typed client boundary in the React app, with environment-driven base URL and query invalidation. | Axios, direct fetch, and the stale shared schema currently disagree about runtime behavior. |
| KTD6 | Implement guided mode as deterministic trace data plus a renderer, not as animation-only logic. | Deterministic traces support stepping, testing, URL/state restoration, reduced motion, and explanations. |
| KTD7 | Keep cross-cutting shared files single-owner per sprint. | `SecurityConfig`, API types, migration configuration, and Vite config are conflict hotspots in the shared checkout. |
| KTD8 | Validate JWT signature, algorithm, issuer/audience when configured, expiry, and server-derived principal; use strict configured CORS origins and document the current bearer-token/CSRF posture before changing storage. | Protected endpoints must never trust a client-supplied user id, wildcard origin, or unsigned/expired token. |

### Existing patterns to preserve

- Spring services/controllers and repository boundaries in `backend/src/main/java/com/dsavisualizer`.
- React Query usage for server state where it already exists.
- Existing `AppShell`, `Reveal`, `CountUp`, reduced-motion, skip-link, and keyboard-focus patterns.
- Existing problem/workspace visual language and the current Judge0 RapidAPI environment variables.
- The merged `/health` endpoint and the Render/GitHub Actions keepalive behavior from the mainline history.

### Dependency graph

```text
Sprint 1: security + correctness
    |
    v
Sprint 2: persisted learning loop
    |
    v
Sprint 3: guided step mode
    |
    v
Sprint 4: scale, architecture, quality, and operations
```

Sprint 1 is a hard prerequisite for progress because the client must not be allowed to self-report completion. Sprint 2 is the prerequisite for guided mode because guided sessions should emit the same problem/progress evidence as ordinary practice. Sprint 4 follows the behavior changes so API consolidation and performance work are based on stable contracts. U12 and U13 must wait for U11 even where their code could be edited independently.

## Implementation Units

### Unit index

| U-ID | Title | Primary files | Depends on |
|---|---|---|---|
| U1 | Reset proof and profile API | Auth/reset controllers, services, DTOs, settings pages | none |
| U2 | Execution boundary and reliability | Security, execution service/controller, Judge0 adapter, workspace | none |
| U3 | Problem DTO and trusted submission | Problem/solution controllers, DTOs, execution receipt | U2 |
| U4 | Sprint 1 integration gate | backend/client tests and API contract notes | U1, U2, U3 |
| U5 | Progress/attempt schema | entities, repositories, migrations, seed/config | U3, U4 |
| U6 | Progress API and server persistence | progress controller/service, client API/hooks | U5 |
| U7 | Practice resume and dashboard loop | workspace, practice, dashboard, query invalidation | U6 |
| U8 | Sprint 2 integration gate | backend integration and browser flows | U5, U6, U7 |
| U9 | Deterministic guided traces | new trace model, algorithm adapters, fixtures | U8 |
| U10 | Guided mode UI and accessibility | workspace/step-mode components and styles | U9 |
| U11 | Sprint 3 integration gate | component/browser tests and fixtures | U9, U10 |
| U12 | API and dependency consolidation | client API/types, Vite config, dependency cleanup | U11 |
| U13 | Performance and persistence hardening | route/editor loading, migrations, indexes, readiness | U11, U12 |
| U14 | CI, observability, and documentation | workflows, tests, README/runbook | U11, U13 |
| U15 | Final regression and cleanup | whole repository | U14 |

### Sprint 1 — Security and correctness

#### U1. Reset proof and profile API

**Goal:** Close the password-reset authorization gap and make settings persist through a validated backend API.

**Requirements:** R1, R2, R6, R11.

**Files:**

- `backend/src/main/java/com/dsavisualizer/controller/ForgotPasswordController.java`
- `backend/src/main/java/com/dsavisualizer/controller/AuthController.java`
- new reset-challenge service, entity, repository, and DTO files only
- `client/src/pages/forgot-password.tsx`
- `client/src/pages/verify-otp.tsx`
- `client/src/pages/reset-password.tsx`
- `client/src/pages/settings.tsx`

**Approach:** Add a reset challenge/proof record with purpose, expiry, consumed state, account binding, hashed proof, and bounded wrong-OTP count. Verify OTP once, invalidate the challenge after repeated failures, return the opaque reset proof only in an HTTPS response body, never store it in URLs/local storage/telemetry, consume it atomically during password change, and revoke outstanding proofs after success. Use generic responses for unknown emails. Add bounded request throttling that fails closed when its store is unavailable. Add `PATCH /auth/profile` with bean validation and an explicit email-verification policy. Return safe error envelopes and replace stack traces with structured logs.

**Test scenarios:** Valid OTP creates a proof; wrong/expired/reused/mismatched proof fails; wrong OTP attempts invalidate a challenge at the limit; proof is never logged or placed in a URL/local storage; unknown and known emails have equivalent public responses; repeated reset requests throttle and limiter failure fails closed; profile validation rejects invalid data; profile changes persist; email policy is enforced.

**Verification:** Add controller/service tests under `backend/src/test/java/com/dsavisualizer/controller` and `backend/src/test/java/com/dsavisualizer/service`. Use manual UI smoke coverage until the frontend harness is introduced in U12, then add page/API assertions there.

#### U2. Execution boundary and reliability

**Goal:** Make code execution an authenticated, bounded, typed backend operation.

**Requirements:** R3, R4, R11.

**Files:**

- `backend/src/main/java/com/dsavisualizer/config/SecurityConfig.java`
- `backend/src/main/java/com/dsavisualizer/controller/CodeExecutionController.java`
- `backend/src/main/java/com/dsavisualizer/service/CodeExecutionService.java`
- `backend/src/main/java/com/dsavisualizer/service/Judge0Service.java`
- new execution request/result DTO files only
- `client/src/components/Workspace/workspace.tsx`
- `client/src/components/Workspace/Playground/playground.tsx`
- `client/src/services/problemService.ts`

**Approach:** Choose authenticated execution as the default and bind identity to the JWT principal. Remove both execution routes from `permitAll`. Validate language, code size, problem identity, test-case bounds, and request shape before calling RapidAPI. Add a configurable overall deadline and per-provider timeout, bounded output, per-user/IP/global quota and in-flight concurrency admission, provider circuit breaking, status mapping, and bounded retries only for safe transient failures. Use an idempotency key to reconcile client retries and persist durable execution state when provider outcome is unknown. Return a typed transient result containing per-case status without provider secrets, and issue receipts only through U3. Fail closed if the limiter or required secret is unavailable. Preserve the existing endpoint during migration and document the HTTP status/error-code matrix for compile, runtime, timeout, quota, and provider failures. Surface failures in the workspace instead of only logging them.

**Test scenarios:** Anonymous requests fail; oversized/unsupported input fails without a Judge0 call; compile/runtime/TLE/provider/quota responses map correctly; timeout returns within the configured bound; concurrent/global admission and output limits hold; provider circuit and limiter failure fail closed; idempotent retries do not create duplicate provider work; UI shows a recoverable error and clears loading state.

**Verification:** Extend `backend/src/test/java/com/dsavisualizer/service/Judge0ServiceTest.java`; add controller tests under `backend/src/test/java/com/dsavisualizer/controller`; use manual UI smoke coverage until the frontend harness is introduced in U12, then add focused client assertions.

#### U3. Problem DTO and trusted submission

**Goal:** Stop leaking reference solutions and stop trusting client-reported completion.

**Requirements:** R4, R5.

**Files:**

- `backend/src/main/java/com/dsavisualizer/entity/PracticeProblem.java`
- `backend/src/main/java/com/dsavisualizer/controller/ProblemController.java`
- `backend/src/main/java/com/dsavisualizer/controller/SolutionController.java`
- `backend/src/main/java/com/dsavisualizer/entity/ExecutionReceipt.java`
- `backend/src/main/java/com/dsavisualizer/repository/ExecutionReceiptRepository.java`
- new receipt service and request/response DTO files only
- `client/src/services/problemService.ts`
- public problem rendering files that consume the safe DTO

**Approach:** Introduce a public problem DTO containing safe examples and a server-only evaluation model for Judge0 fixtures. Update the problem seed/initializer and client problem rendering to consume the split contract. Remove solution code and hidden evaluation fields from public problem responses. A successful execution returns an opaque receipt id; `POST /solutions` requires that receipt and no longer uses client `passed` as an authoritative field. Store the receipt hashed or signed with a protected key, tied to user, problem, code hash, language, server test-set version, execution request id, result, and expiry. Consume it atomically with completion persistence and reject replay/cross-user use. Do not add a reference-solution reveal path in this roadmap.

**Test scenarios:** Public list/detail serialization excludes solution fields; no public endpoint returns reference solutions; forged `passed: true` cannot complete a problem; a valid receipt can complete the matching problem once; receipt expiry, replay, cross-user reuse, wrong code hash, and wrong test-set version all fail.

**Verification:** Add JSON/controller tests and service tests under `backend/src/test/java/com/dsavisualizer`.

#### U4. Sprint 1 integration gate

**Goal:** Prove the security contract before adding progress features.

**Requirements:** R1–R6, R11, R12.

**Files:** test fixtures, API documentation, and only integration conflict files.

**Approach:** Resolve shared-file conflicts from U1–U3. Update API docs or examples. Check the deployment files actually present in this checkout, verify the configured health endpoint/keepalive path, and do not assume an unavailable mainline-only workflow. Check that local secrets remain ignored.

**Test scenarios:** Full reset flow; authenticated execution and valid receipt flow; public problem fetch; forged submission; profile update; health endpoint.

**Verification:** `mvn test`, frontend check/build, focused integration tests, and a manual API smoke pass against local services.

### Sprint 2 — Persisted learning loop

#### U5. Progress and attempt schema

**Goal:** Add durable per-problem learner state without losing existing topic progress.

**Requirements:** R7, R11.

**Files:**

- `backend/src/main/java/com/dsavisualizer/entity/UserProgress.java`
- `backend/pom.xml`
- `backend/src/main/java/com/dsavisualizer/entity/UserProblemProgress.java`
- `backend/src/main/java/com/dsavisualizer/entity/ProblemAttempt.java`
- matching repositories and services for the two new entities
- `backend/src/main/resources/application.properties`
- `backend/src/main/resources/db/migration/V1__baseline.sql`
- `backend/src/main/resources/db/migration/V2__problem_progress_and_attempts.sql`
- related backend tests

**Approach:** Add Flyway, create a baseline migration plus a progress/attempt migration, and run migrations before seeding. Model user/problem progress, bounded draft metadata, attempt status, timestamps, best runtime, best result status/language/code hash, last execution receipt reference, and completion. Add unique constraints and indexes for user/problem and attempt lookup. Preserve existing topic-level `UserProgress` rows as legacy aggregate data; do not infer individual problem completion from them. Set production Hibernate mode to `validate` after the baseline is verified.

**Test scenarios:** A user has at most one current progress row per problem; attempts are append-only; duplicate completion is idempotent; migration works on an existing database; existing topic progress remains readable.

**Verification:** Migration tests or a repeatable local migration run plus repository/service tests.

#### U6. Progress API and server persistence

**Goal:** Expose the learning state through authenticated, server-authoritative endpoints.

**Requirements:** R4, R7, R8.

**Files:**

- `backend/src/main/java/com/dsavisualizer/controller/ProgressController.java`
- `backend/src/main/java/com/dsavisualizer/service/UserProgressService.java`
- new progress DTOs/services with exact ownership in this unit
- `client/src/features/progress/progressApi.ts`
- `client/src/features/progress/progressHooks.ts`
- `client/src/hooks/*`

**Approach:** Add authenticated endpoints for `GET /progress/problems`, `GET /progress/summary`, `GET /progress/problems/{problemId}`, bounded draft save, attempt listing, and execution/submission outcome recording. Derive completion only from U3 receipts. Return allowlisted fields for drafts, attempts, best runtime/status/language, and timestamps; never return reset/JWT/provider secrets or raw credentials. Use ownership checks and invalidate affected React Query keys after mutations. Keep payloads small and avoid storing full untrusted execution output indefinitely.

**Test scenarios:** Cross-user reads/writes fail; draft save is bounded and idempotent; attempt history orders correctly; completion updates dashboard aggregates; invalidation refreshes the client.

**Verification:** Controller/service integration tests and typed client tests.

#### U7. Practice resume and dashboard loop

**Goal:** Make persisted state visible where learners work.

**Requirements:** R7, R8.

**Files:**

- `client/src/components/Workspace/workspace.tsx`
- `client/src/pages/practice.tsx`
- `client/src/pages/home.tsx`
- practice/dashboard components with exact ownership in this unit
- `client/src/features/progress/*`

**Approach:** Autosave drafts with debounce and bounded payloads. Track active time with visibility-aware timers. Add tags to the problem DTO/seed data and query support for difficulty, tags, and solved state. Show solved/in-progress/attempted states, best runtime/status/language, last-attempt time, and resume actions. Keep submission as the only completion action. Add clear empty/loading/error states.

**Test scenarios:** Refresh restores a draft; hidden tabs do not inflate time; filters combine correctly; failed submissions do not mark solved; successful submissions update the dashboard.

**Verification:** Component tests plus browser flows for login, practice, submit, refresh, and dashboard.

#### U8. Sprint 2 integration gate

**Goal:** Validate the complete learner loop before guided mode.

**Requirements:** R4, R7, R8, R12.

**Verification:** `mvn test`, migration run, `npm run check`, `npm run build`, and browser smoke coverage for resume/progress/submission ownership.

### Sprint 3 — Guided step mode

#### U9. Deterministic guided traces

**Goal:** Define a testable trace contract and implement two representative algorithms.

**Requirements:** R9.

**Files:**

- new trace types/fixtures under `client/src/features/guided-mode` or the repository's established feature location
- selected visualization/algorithm modules under `client/src/components/visualizations`
- trace unit tests

**Approach:** Define immutable trace events with step id, code line, state snapshot, narration, and optional focus metadata. Implement adapters for one linear structure algorithm and one sorting or graph algorithm. Keep traces deterministic and serializable. Reuse existing visualization primitives where possible.

**Test scenarios:** Trace starts/ends correctly; every event has valid state and explanation; stepping does not mutate prior snapshots; unsupported algorithms fail clearly; reduced motion does not change state order.

**Verification:** Unit tests for trace generation and fixture snapshots.

#### U10. Guided mode UI and accessibility

**Goal:** Add step controls and synchronized explanations without disrupting ordinary visualizations.

**Requirements:** R9.

**Files:**

- new guided-mode components under `client/src/features/guided-mode`
- named workspace integration files under `client/src/components/Workspace`
- named visualization components and styles under `client/src/components/visualizations`

**Approach:** Add play/pause, next, previous, restart, progress indicator, code-line highlight, narration panel, and mobile-friendly layout. Support keyboard controls, visible focus, ARIA labels/live updates, and reduced motion. Make the guided mode opt-in per supported algorithm.

**Test scenarios:** Keyboard users can complete the flow; screen-reader labels identify controls; previous/next boundaries are safe; mobile layout remains usable; reduced-motion mode avoids forced animation.

**Verification:** Component tests, accessibility checks, and browser interaction flow.

#### U11. Sprint 3 integration gate

**Goal:** Ensure guided mode is additive and does not regress existing visualizations or workspace submission.

**Files:** guided-mode fixtures, affected visualization/workspace components, and browser test specs.

**Test scenarios:** Existing visualization and submission smoke flows still pass; guided mode emits no progress completion without the normal trusted submission path.

**Verification:** Client checks/build, guided-mode unit/component tests, browser smoke tests for both guided and ordinary paths, and manual keyboard/reduced-motion review.

### Sprint 4 — Scale, architecture, quality, and operations

#### U12. API and dependency consolidation

**Goal:** Remove conflicting client data paths and dead dependencies.

**Requirements:** R10, R12.

**Files:**

- `client/src/lib/api.ts`
- `client/src/services/problemService.ts`
- `client/src/lib/queryClient.ts`
- `client/shared/schema.ts`
- `client/src/App.tsx`
- `client/package.json`
- `client/package-lock.json`
- `client/vite.config.ts`
- `client/tsconfig.json`
- `client/drizzle.config.ts`
- `client/shared/schema.ts`

**Approach:** Introduce the frontend test harness (Vitest/Testing Library or the repository's compatible equivalent) before the refactor. Select one API client and centralize auth/error handling. Make base URLs environment-driven and align dev proxy behavior with the configured deployment. Remove or isolate stale Replit/Express/Drizzle/shared-schema artifacts only after a usage scan, including the nonexistent `server` TypeScript include and stale production start command. Add route-level lazy loading and move editor loading behind the workspace route. Keep API type definitions close to the canonical backend contract.

**Test scenarios:** Dev and production API URLs resolve correctly; auth failures are handled consistently; no stale endpoint is used; route chunks load on demand; removed packages have no imports.

**Verification:** `npm run check`, `npm run build`, dependency usage scan, focused frontend tests, and an automated entry-chunk threshold of 700 kB uncompressed; any exception must name an owner, reason, and follow-up issue.

#### U13. Performance and persistence hardening

**Goal:** Make deployment behavior predictable under growth.

**Requirements:** R10, R11.

**Files:**

- `client/src/App.tsx` and workspace editor modules
- `backend/src/main/resources/application.properties`
- migration/index files
- health/readiness controllers/config
- `.gitignore` and local environment documentation

**Approach:** Meet the 700 kB main-entry target as an automated gate, lazy-load Monaco, update stale browserslist metadata, add database indexes, and ensure migration configuration is explicit. Separate liveness from readiness and define the database as required for readiness while Judge0 remains a reported degraded dependency unless the deployment contract changes. Add `backend/src/main/resources/application-local.properties` to ignore rules if it remains local-only, and document safe local variables.

**Test scenarios:** Build passes the entry budget; app still loads directly at each route; readiness reports database/provider state without leaking credentials; local config is not tracked.

**Verification:** Build budget check, backend health tests, migration run, and deployment smoke test.

#### U14. CI, observability, and documentation

**Goal:** Make quality and operations repeatable for contributors and deployment.

**Requirements:** R11, R12.

**Files:**

- `.github/workflows/*`
- `README.md`
- new testing/runbook docs
- backend logging/config files
- frontend test configuration and test files

**Approach:** Add CI jobs for backend tests, frontend check/build, focused integration/browser tests, and dependency/security reporting with documented triage. Own the frontend test configuration, scripts, fixtures, and lockfile updates here if U12 only bootstraps the harness. Use safe structured errors and production log levels. Update README architecture, environment variables, Judge0/RapidAPI setup, the health/keepalive configuration actually used by deployment, and the learning/test flows.

**Test scenarios:** CI runs on a clean checkout; missing secrets fail with actionable messages; test reports are retained; health keepalive does not expose secrets; README setup matches actual commands.

**Verification:** Run the same CI commands locally and inspect the workflow on a clean branch.

#### U15. Final regression and cleanup

**Goal:** Deliver a coherent change set with no abandoned experiments.

**Requirements:** R1–R12.

**Approach:** Review the complete diff, remove dead code and abandoned attempts, reconcile API docs, confirm no secrets or unrelated tool artifacts are staged, and run the complete verification contract. Preserve unrelated user changes in the working tree.

**Verification:** Final review, complete test matrix, manual critical flows, and clean `git diff --check`.

## Verification Contract

### Baseline and recurring commands

Run from the repository root unless noted:

```powershell
Set-Location backend; .\mvnw.cmd test
Set-Location ..\client; npm run check
Set-Location ..\client; npm run build
```

If the Maven wrapper is unavailable, use the installed Maven command. Add focused commands as each test harness is introduced. Do not treat a passing build as proof of the security requirements.

### Required quality gates by sprint

- Sprint 1: backend unit/controller/security tests, frontend check/build, API smoke flows, and secret/status inspection.
- Sprint 2: migration/repository/service tests, progress API tests, frontend component tests, and browser resume/submission flows.
- Sprint 3: trace unit tests, guided component/a11y tests, and browser keyboard/reduced-motion flows.
- Sprint 4: full test matrix, bundle budget, dependency usage/audit review, CI clean-checkout run, health/readiness checks, and documentation verification.

### Minimum browser flows

1. Register/login and load a problem.
2. Run code with success, compile failure, runtime failure, and timeout/provider failure states.
3. Submit a valid solution and confirm progress changes.
4. Attempt a forged completion request and confirm progress does not change.
5. Save a draft, refresh, and resume it.
6. Filter practice problems and open a guided trace.
7. Complete password reset with valid OTP and reject replay/invalid proof.
8. Navigate key flows by keyboard with reduced motion enabled.

## Definition of Done

### Global

- Every requirement R1–R12 maps to code and at least one verification scenario.
- Each implementation unit is complete or has a documented, non-blocking deferment.
- No public API leaks solution code, hidden tests, provider keys, JWTs, OTPs, raw outputs, or stack traces. The only bearer credential returned by a reset API is the opaque, short-lived reset proof, and it is returned only in an HTTPS response body with no URL/local-storage/telemetry/log exposure.
- Existing user data and the merged health/keepalive behavior are preserved.
- No local secret file or unrelated untracked artifact is staged.
- Abandoned experiments, dead imports, and temporary debugging code are removed.
- The final test matrix passes, and failures that depend on external paid services are documented with a local mock path.

### Sprint gates

- Sprint 1 is done only when U4 passes and trusted completion is enforced end to end.
- Sprint 2 is done only when U8 passes and a user can resume a problem with persisted evidence.
- Sprint 3 is done only when U11 passes and guided mode is accessible and additive.
- Sprint 4 is done only when U14 and U15 pass, the main bundle target is met or an explicit exception is recorded, and the README/runbook matches deployment.

## Documentation / Operational Notes

- Keep Judge0 credentials in Render/GitHub secrets or environment variables. Never add them to the repository or client bundle.
- Preserve the configured deployment health endpoint and any GitHub Actions keepalive. If deployment has moved between Fly.io and Render, document the active provider and add its explicit health-check configuration. Prefer a readiness endpoint for deploy diagnostics, but do not make external Judge0 availability block basic liveness unless the deployment contract requires it.
- Use mocks for local execution tests so the test suite does not spend RapidAPI quota.
- Run dependency updates as reviewed changes. Do not use a blanket force-fix that upgrades unrelated major versions without testing.

## Sources / Research

- `backend/src/main/java/com/dsavisualizer/controller/ForgotPasswordController.java` — reset proof gap and unsafe response/logging behavior.
- `backend/src/main/java/com/dsavisualizer/config/SecurityConfig.java` — public execution routes and CORS/auth boundary.
- `backend/src/main/java/com/dsavisualizer/controller/CodeExecutionController.java` and `backend/src/main/java/com/dsavisualizer/service/CodeExecutionService.java` — execution contract and blocking/provider behavior.
- `backend/src/main/java/com/dsavisualizer/controller/ProblemController.java` and `backend/src/main/java/com/dsavisualizer/entity/PracticeProblem.java` — public entity serialization and solution fields.
- `backend/src/main/java/com/dsavisualizer/controller/SolutionController.java` — client-controlled `passed` state.
- `client/src/pages/settings.tsx` — profile mutation currently has no backend persistence.
- `client/src/components/Workspace/workspace.tsx` — current submit, test-case, and workspace state flow.
- `client/src/App.tsx`, `client/src/lib/api.ts`, `client/src/lib/queryClient.ts`, `client/src/services/problemService.ts`, and `client/vite.config.ts` — eager routes and mixed API/environment paths.
- `backend/src/main/resources/application.properties` — `ddl-auto=update`, debug logging, and runtime configuration.
- `backend/src/test/java/com/dsavisualizer/service/Judge0ServiceTest.java` — current backend test coverage baseline.
- `origin/main` health controller/security allowlist — existing deployment liveness behavior to preserve.
