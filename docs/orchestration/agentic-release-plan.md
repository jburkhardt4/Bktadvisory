# BKT Advisory Agentic Release Plan

## Purpose

This document is the control-plane source of truth for the BKT Advisory website launch project. It defines the delivery sequence, agent operating standards, role assignments, testing requirements, and release gates for work scoped to the following repositories:

- `jburkhardt4/Bktadvisory`
- `jburkhardt4/Bktadvisoryprojectestimator`

## Operating Model

### Source of truth

Use GitHub as the system of record for planning, execution, review, and release readiness.

- Planning artifact: `docs/orchestration/agentic-release-plan.md`
- Prompt artifact: `docs/orchestration/prompt-library.md`
- Execution artifacts: GitHub Issues, branches, and Pull Requests
- Validation artifacts: screenshots, test output, visual diffs, preview notes, and release-gate checklists

### Daily command center

Use browser-based VS Code Codespaces as the primary operating environment.

- Read and edit both repositories from Codespaces
- Launch agent work from Codespaces using the prompt library
- Review branches, PRs, screenshots, diffs, and validation evidence in GitHub
- Make final merge and release decisions from the human review loop

### Coordination rule

Agents do not silently coordinate in the background. Coordination happens through shared artifacts.

The communication path is:

1. JB defines priority and scope
2. Agents read the same orchestration documents
3. Agents publish work through GitHub artifacts or environment-specific outputs
4. JB reviews conflicts, gaps, and blockers
5. JB approves implementation, merge, and release

## Repositories in Scope

### `jburkhardt4/Bktadvisory`

Primary responsibility:

- marketing site
- admin portal
- client portal
- project dashboard
- authentication and protected routing
- cross-application orchestration and release governance

### `jburkhardt4/Bktadvisoryprojectestimator`

Primary responsibility:

- estimator-specific UX and state handling
- quote generation flow
- estimator mobile optimization
- quote output and estimator-side validation requirements
- data handoff requirements that support quote-to-project automation

## Delivery Sequence

Execute work in this order to reduce rework and prevent scope drift.

### Phase 1 — Design system lock

Goal:

- achieve flawless light, dark, and system theme behavior
- enforce shared design tokens, component behavior, and mobile breakpoints

Acceptance criteria:

- shared global tokens for color, spacing, typography, radius, and elevation
- no visual drift across marketing site, admin portal, client portal, project dashboard, and estimator surfaces
- system theme respects device preference
- desktop and mobile review completed for all key screens
- no material contrast or accessibility regressions on critical flows

### Phase 2 — Authentication and navigation integrity

Goal:

- stabilize SSO, session handling, route protection, and portal boundaries

Acceptance criteria:

- protected routes behave correctly
- auth state and session transitions are reliable
- no portal leakage across unauthorized states
- redirects and route guards behave predictably on desktop and mobile

### Phase 3 — Quote-to-project workflow

Goal:

- ensure a signed quote can be turned into an active project with minimal manual friction

Acceptance criteria:

- signed quote intake path is defined
- admin-side input area or intake process is defined
- project creation handoff is defined and testable
- secure client visibility requirements are preserved
- admin progress updates remain possible after project creation

### Phase 4 — Mobile UX hardening

Goal:

- re-evaluate all recent portal, dashboard, and estimator work for production-ready mobile use

Acceptance criteria:

- critical workflows remain fully usable on phone-size screens
- no component overflow on primary views
- navigation, forms, cards, and dashboards remain usable on mobile
- parity is maintained for critical desktop functions

### Phase 5 — Automated verification gate

Goal:

- eliminate unverified UI and workflow changes from the release path

Acceptance criteria:

- browser-driven end-to-end verification exists for critical flows
- visual snapshot or screenshot-based verification exists for critical surfaces
- preview validation is performed for meaningful changes
- PR evidence exists for visual and functional validation

### Phase 6 — Value-add features

Goal:

- prevent the client portal and dashboard experience from feeling disposable or gimmicky

Each agent must propose at least two to three enhancements ranked by:

- impact
- implementation effort
- release risk
- suitability for zero-human-coding execution

## Core Deliverables

### 1. Design consistency

Scope:

- marketing site
- admin portal
- client portal
- project dashboard
- estimator flows

### 2. Functional integrity

Scope:

- authentication and portal access
- route protection
- estimator to quote handoff
- quote to project creation workflow
- secure client-facing access
- admin update path

### 3. Mobile hardening

Scope:

- all work added in the last one to two weeks
- high-traffic screens
- quote and estimator paths
- navigation and content readability

### 4. Product value beyond gimmick

Each agent must propose at least two to three ideas from categories such as:

- notification preferences by channel
- project milestone digest
- client action checklist
- approval or status request flows
- secure document center
- activity timeline improvements
- lightweight messaging or acknowledgements
- mobile web app optimization
- saved preferences or personalization

## Agent Responsibility Model

### JB — Human operator and release authority

Primary responsibility:

- final prioritization
- scope control
- approval for irreversible actions
- merge and release authority
- escalation path for blockers

Approval triggers:

- `Approve: implement`
- `Approve: merge`
- `Approve: release`
- `Approve: send`
- `Approve: schedule`

### Codex / Copilot / GitHub code agents

Primary responsibility:

- implement and refactor release-critical workflows
- align code to locked design-system rules
- own route safety, logic integrity, workflow wiring, and validation evidence

Required deliverables:

1. Objective
2. Assumptions
3. Affected files, modules, routes, and components
4. Implementation plan
5. Test plan
6. Visual verification method
7. Functional verification method
8. Risks and blockers
9. Two to three recommended improvements
10. Exact next action

### Gemini strategy agent

Primary responsibility:

- generate alternatives
- critique plans
- pressure-test architecture, edge cases, and product ideas
- propose improvements before implementation begins

Required deliverables:

1. Objective
2. Assumptions
3. Architectural or product options
4. Risks and failure modes
5. Recommended path ranked by actionability
6. Two to three additional feature or workflow ideas
7. Exact next action

### Figma / design agent

Primary responsibility:

- lock design system
- validate light, dark, and system theme parity
- audit mobile responsiveness and visual QA

Required deliverables:

1. Objective
2. Screens and components audited
3. Theme parity issues
4. Mobile UX issues
5. Design system recommendations
6. Visual validation method
7. Two to three additional design or UX ideas
8. Exact next action

### Replit / preview / runtime validation agent

Primary responsibility:

- confirm live or preview behavior
- validate user flows in a running environment
- identify preview-visible defects

Required deliverables:

1. Objective
2. Flows validated
3. Preview-visible UX issues
4. Functional issues observed
5. Mobile observations
6. Verification method
7. Two to three additional usability or value ideas
8. Exact next action

## Required Operating Standard for Every Agent

1. Read the current orchestration plan before acting.
2. Convert rough prompts into a structured execution plan before doing work.
3. Do not assume setup is correct; verify.
4. Do not mark work complete without explicit visual and functional validation.
5. If tooling is missing, provide novice-friendly setup steps with exact labels and actions.
6. Propose two to three additional high-value improvements beyond the requested task.
7. Rank recommendations by impact, effort, risk, and release-readiness.
8. Minimize scope creep in active release work.
9. Surface blockers immediately.
10. Never ship unverified UI or workflow changes.

## Mandatory Testing Standard

Every task must include:

- what changed
- how it was tested visually
- how it was tested functionally
- what remains unverified
- what human action is still required, if any

### Standardized testing stack

1. Playwright for browser-based end-to-end testing
2. Visual snapshot testing or screenshot comparison for regressions
3. Preview-environment validation for meaningful changes
4. PR gate requiring visual and functional evidence
5. Design-reference comparison against Figma for critical screens

### Minimum release gate

A change is not release-ready unless it has:

- visual verification
- functional verification
- mobile verification
- theme verification
- auth and routing verification where relevant

## Risks

- Scope creep can delay release-critical work
- Missing automated tests can allow regressions to compound
- Desktop-first changes can break mobile layouts
- External tool or credential dependencies can block verification
- Multi-agent divergence can create branch and merge chaos if artifacts are not centralized

## Chronological Rollout Guide

### Slot 1 — Establish control plane

- confirm repository scope
- store this document in `Bktadvisory`
- store prompt library in `Bktadvisory`
- store estimator-specific constraints in `Bktadvisoryprojectestimator`
- create GitHub issues or equivalent work items from the active priorities

### Slot 2 — Freeze design requirements

- complete design-system audit first
- require token and state review before ad hoc UI churn continues
- block nonessential design work until baseline parity is locked

### Slot 3 — Execute critical implementation and validation

- assign auth hardening
- assign quote-to-project hardening
- assign mobile hardening
- assign automated QA setup
- require evidence on every implementation branch or PR

## Acceptance Criteria for Overall Launch

- [ ] Light, dark, and system theme are consistent across all major surfaces
- [ ] Mobile UX is production-acceptable across admin, client, dashboard, and estimator flows
- [ ] Auth, SSO, and protected routing are stable
- [ ] Quote-to-project workflow is defined and validated
- [ ] Admin can update project progress and client-facing visibility remains secure
- [ ] Visual verification workflow exists
- [ ] Functional verification workflow exists
- [ ] Each agent has proposed at least two worthwhile enhancements
- [ ] Release blockers are explicitly listed and ranked

## Execution Notes

- This document is a control-plane artifact, not an auto-executing workflow.
- Prompts do not fan out automatically to agents.
- Agents do not automatically talk to one another unless a platform explicitly supports that behavior.
- Use this document to keep prompts, outputs, and validation aligned across environments.
