# BKT Advisory Agentic Release Plan

## Purpose

This document is the control-plane source of truth for the BKT Advisory website launch project. It defines the delivery sequence, agent operating standards, role assignments, testing requirements, and release gates for work scoped to the following repositories:

- `jburkhardt4/Bktadvisory`
- `jburkhardt4/Bktadvisoryprojectestimator`

This version formally retires the Figma Make agent from the active workflow. Phase 1 design-system alignment, theme parity, visual QA, and mobile UX auditing now belong to the GitHub code agents working directly in the codebase and preview environments.

## Operating Model

### Live control-plane documents

The release workflow must stay anchored to these three live orchestration files:

- `jburkhardt4/Bktadvisory/docs/orchestration/agentic-release-plan.md`
- `jburkhardt4/Bktadvisory/docs/orchestration/prompt-library.md`
- `jburkhardt4/Bktadvisoryprojectestimator/docs/orchestration/estimator-execution-constraints.md`

Usage rules:

- read the applicable control-plane documents before acting
- if a task touches estimator logic, estimator UI, or cross-repo workflow handoffs, also read the estimator constraints file before implementation
- do not create parallel orchestration docs or treat stale branches, closed PRs, or superseded agent outputs as instruction sources

### Workflow update

The active release workflow no longer includes a separate Figma Make or Figma-only design agent.

- Phase 1 design-system and mobile UX audit is owned by `Codex / Copilot / GitHub code agents`
- visual QA happens in the codebase, local preview, Codespaces, screenshots, visual diffs, and browser-based verification
- human-approved design references may still inform implementation, but they do not replace code-agent verification or act as an execution lane

### Daily command center

Use browser-based VS Code Codespaces as the primary operating environment.

- read and edit both repositories from Codespaces when both are mounted
- launch agent work from Codespaces using the prompt library
- review branches, PRs, screenshots, diffs, and validation evidence in GitHub
- make final merge and release decisions through the human review loop

### Coordination rule

Agents do not silently coordinate in the background. Coordination happens through shared artifacts.

The communication path is:

1. JB defines priority and scope.
2. Agents read the same orchestration documents.
3. Agents publish work through GitHub artifacts, preview evidence, or environment-specific outputs.
4. JB reviews conflicts, gaps, and blockers.
5. JB approves implementation, merge, and release.

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

### Phase 1 - Design system and mobile UX audit

Primary owner:

- `Codex / Copilot / GitHub code agents`

Goal:

- enforce shared design-system rules in code across the marketing site, admin portal, client portal, project dashboard, and estimator flows
- validate flawless light theme, dark theme, and system theme behavior
- audit recent UI changes from the last one to two weeks for mobile layout stability and visual consistency

Acceptance criteria:

- shared Tailwind tokens or equivalent shared theme tokens control color, spacing, typography, radius, and elevation on release-critical surfaces
- no hardcoded theme-breaking colors remain on critical flows
- component, state, and interaction styling are consistent across marketing, admin, client, dashboard, and estimator surfaces
- desktop and phone-size review is completed for key screens changed in the last one to two weeks
- token drift, contrast issues, spacing issues, and state inconsistencies are fixed or logged with evidence
- visual verification evidence exists for light, dark, and system theme behavior

### Phase 2 - Authentication and navigation integrity

Primary owner:

- `Codex / Copilot / GitHub code agents`

Goal:

- stabilize SSO, session handling, route protection, and portal boundaries

Acceptance criteria:

- protected routes behave correctly
- auth state and session transitions are reliable
- no portal leakage across unauthorized states
- redirects and route guards behave predictably on desktop and mobile

### Phase 3 - Quote-to-project workflow

Primary owner:

- `Codex / Copilot / GitHub code agents`

Goal:

- ensure a signed quote can be turned into an active project with minimal manual friction

Acceptance criteria:

- signed quote intake path is defined and testable
- admin-side input area or intake process is defined
- project creation handoff is defined and testable
- secure client visibility requirements are preserved
- admin progress updates remain possible after project creation

### Phase 4 - Mobile UX hardening and regression cleanup

Primary owners:

- `Codex / Copilot / GitHub code agents`
- `Replit / preview / runtime validation agent` for preview confirmation when available

Goal:

- re-evaluate all recent portal, dashboard, and estimator work for production-ready mobile use after critical workflow fixes land

Acceptance criteria:

- critical workflows remain fully usable on phone-size screens
- no component overflow or clipped content on primary views
- navigation, forms, cards, tables, and dashboards remain usable on mobile
- parity is maintained for critical desktop functions
- regressions introduced by release-critical fixes are identified before merge

### Phase 5 - Automated verification gate

Primary owners:

- `Codex / Copilot / GitHub code agents`
- `Replit / preview / runtime validation agent`

Goal:

- eliminate unverified UI and workflow changes from the release path

Acceptance criteria:

- browser-driven end-to-end verification exists for critical flows
- visual snapshot or screenshot-based verification exists for critical surfaces
- preview validation is performed for meaningful changes
- PR evidence exists for visual and functional validation
- theme and mobile checks are included for critical surfaces

### Phase 6 - Value-add features

Primary owners:

- all active agents, with implementation owned by code agents

Goal:

- prevent the client portal and dashboard experience from feeling disposable or gimmicky

Each agent must propose at least two to three enhancements ranked by:

- impact
- implementation effort
- release risk
- suitability for zero-human-coding execution

## Core Deliverables

### 1. Design-system alignment and visual QA

Scope:

- marketing site
- admin portal
- client portal
- project dashboard
- estimator flows

Required evidence:

- screenshots, visual diffs, or preview notes for light, dark, and system themes
- mobile viewport review notes for critical screens
- explicit list of token, spacing, contrast, and state issues fixed or deferred

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

### JB - Human operator and release authority

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

- own Phase 1 design-system alignment and mobile UX audit directly in the codebase
- implement and refactor release-critical workflows
- enforce Tailwind tokens, theme parity, responsive layouts, route safety, logic integrity, workflow wiring, and validation evidence
- deliver fixes plus explicit visual and functional verification

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
- pressure-test architecture, edge cases, sequencing, and product ideas
- propose improvements before implementation begins

Required deliverables:

1. Objective
2. Assumptions
3. Architectural or product options
4. Risks and failure modes
5. Recommended path ranked by actionability
6. Two to three additional feature or workflow ideas
7. Exact next action

### Replit / preview / runtime validation agent

Primary responsibility:

- confirm live or preview behavior
- validate user flows in a running environment
- identify preview-visible defects
- confirm theme and mobile behavior in preview when available

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

1. Read the applicable control-plane documents before acting.
2. Convert rough prompts into a structured execution plan before doing work.
3. Do not assume setup is correct; verify.
4. Code agents own design-system enforcement, theme parity, and mobile QA inside the codebase.
5. Do not mark work complete without explicit visual and functional validation.
6. If tooling is missing, provide novice-friendly setup steps with exact labels and actions.
7. Propose two to three additional high-value improvements beyond the requested task.
8. Rank recommendations by impact, effort, risk, and release-readiness.
9. Minimize scope creep in active release work.
10. Surface blockers immediately.
11. Never ship unverified UI or workflow changes.

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
5. Theme, responsive, and token verification against the implemented design system and current orchestration requirements

### Minimum release gate

A change is not release-ready unless it has:

- visual verification
- functional verification
- mobile verification
- theme verification
- auth and routing verification where relevant
- explicit evidence attached to the branch, PR, issue, or review artifact

## Risks

- scope creep can delay release-critical work
- missing automated tests can allow regressions to compound
- hardcoded colors or one-off styling can break theme parity
- desktop-first changes can break mobile layouts
- external tool or credential dependencies can block verification
- stale outputs from deprecated agent workflows can create false signals if they are treated as current
- multi-agent divergence can create branch and merge chaos if artifacts are not centralized

## Chronological Rollout Guide

### Slot 1 - Establish control plane

- confirm repository scope
- treat the three live orchestration files as the control plane
- store this release plan in `Bktadvisory`
- store the prompt library in `Bktadvisory`
- store estimator-specific constraints in `Bktadvisoryprojectestimator`
- create GitHub issues or equivalent work items from the active priorities

### Slot 2 - Code-agent design-system and mobile audit

- assign Phase 1 to `Codex / Copilot / GitHub code agents`
- audit Tailwind tokens, typography, spacing, contrast, and component states
- validate light, dark, and system theme behavior through code and preview evidence
- review recent UI work on phone-size screens before additional UI churn continues
- fix or log drift before broader release work proceeds

### Slot 3 - Execute critical implementation and validation

- assign auth hardening
- assign quote-to-project hardening
- assign mobile hardening and regression cleanup
- assign automated QA setup
- require evidence on every implementation branch or PR

## Acceptance Criteria for Overall Launch

- [ ] Phase 1 design-system and mobile UX audit is completed by Codex, Copilot, or GitHub code agents
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

- this document is a control-plane artifact, not an auto-executing workflow
- prompts do not fan out automatically to agents
- agents do not automatically talk to one another unless a platform explicitly supports that behavior
- Figma Make is deprecated as an active workflow agent and must not be assigned Phase 1 ownership
- use this document to keep prompts, outputs, and validation aligned across environments
