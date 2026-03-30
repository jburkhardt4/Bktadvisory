# BKT Advisory Project Estimator Execution Constraints

## Purpose

This document defines the repository-specific constraints for work performed in `jburkhardt4/Bktadvisoryprojectestimator`. It exists to prevent estimator work from drifting into unrelated marketing-site concerns while still aligning the estimator with the broader BKT Advisory launch plan.

## Repository Scope

This repository is responsible for estimator-specific behavior and launch-critical estimator deliverables, including:

- estimator UI and UX
- quote-generation flow
- estimator mobile optimization
- quote output integrity
- estimator-side requirements that support quote-to-project handoff
- document-generation or export concerns that originate inside the estimator experience

This repository should not become the catch-all location for unrelated marketing-site or portal work.

## Relationship to `Bktadvisory`

`Bktadvisory` remains the broader control-plane repository for launch orchestration, portal behavior, routing, and release governance.

Use this estimator repository when the task is specifically about:

- estimator state and UX
- quote presentation or generation behavior
- estimator-side calculations or flow logic
- estimator export, print, or handoff requirements
- estimator-specific mobile defects

Use `Bktadvisory` when the task is specifically about:

- marketing pages
- client portal
- admin portal
- project dashboard
- authentication and protected routing
- cross-repo orchestration documents

## Launch-Critical Estimator Deliverables

### 1. Theme consistency

The estimator must align with the broader BKT Advisory light, dark, and system theme standards.

**Acceptance criteria:**

- no visual drift from BKT Advisory branding
- shared color, spacing, and typography intent is preserved
- theme behavior remains stable across desktop and mobile

### 2. Quote generation integrity

The estimator must reliably guide a user from inputs to a usable quote outcome.

**Acceptance criteria:**

- quote generation flow remains deterministic
- generated quote content is readable, branded, and traceable
- quote metadata required for downstream tracking is preserved
- print or export behavior does not regress core usability

### 3. Quote-to-project handoff readiness

The estimator must support the broader launch requirement that a signed quote can feed project creation with minimal manual friction.

**Acceptance criteria:**

- quote identifiers or handoff data are preserved where required
- handoff assumptions are documented explicitly
- missing automation steps are called out instead of being implied away
- human intervention requirements are clearly stated when automation is not yet complete

### 4. Mobile UX hardening

The estimator must be usable on phone-size screens without layout failure.

**Acceptance criteria:**

- forms remain readable and navigable on mobile
- tap targets are acceptable
- sticky or persistent UI does not obstruct inputs or quote review
- generated quote review is usable on mobile where required

### 5. Verification maturity

This repository currently has a lighter script surface than the primary website repository, so estimator work must compensate with explicit validation discipline.

**Minimum validation expectation:**

- successful build verification
- screenshot or visual evidence for material UI changes
- functional walkthrough notes for estimator-to-quote flow changes
- explicit statement of what remains unverified

## Required Agent Output for Estimator Work

Any agent working in this repository must return:

1. Objective
2. Assumptions
3. Affected files, flows, and components
4. Implementation plan
5. Test plan
6. Visual verification method
7. Functional verification method
8. Risks and blockers
9. Two to three recommended improvements
10. Exact next action

## Mandatory Constraints

1. Do not expand estimator work into unrelated portal or marketing-site tasks.
2. Do not claim quote-to-project automation is complete unless the full handoff path is explicitly verified.
3. Do not mark estimator work complete without visual and functional validation.
4. If document export, print, or file generation behavior changes, state exactly how it was validated.
5. If automation or testing is missing, define the setup path instead of hiding the gap.
6. Surface any dependency on external services, credentials, or manual review immediately.

## Estimator-Specific Task Categories

### A. Quote UX and output

Examples:

- quote readability
- print layout
- generated metadata
- file naming
- export states
- status messaging

### B. Estimator flow logic

Examples:

- step navigation
- validation behavior
- conditional questions
- complexity logic
- data normalization

### C. Mobile and responsive corrections

Examples:

- form compression
- card stacking
- sticky element overlap
- small-screen spacing and readability

### D. Launch enablement

Examples:

- missing validation hooks
- screenshot evidence workflow
- minimal automated checks
- handoff documentation to `Bktadvisory`

## Required Validation Notes

Every estimator task must explicitly state:

- what was changed
- how it was tested visually
- how it was tested functionally
- what remains unverified
- what human action is still required

## Recommended Improvements Requirement

Every estimator task must include two to three ideas from categories such as:

- better quote clarity
- higher client confidence during estimate review
- smoother mobile completion
- stronger handoff to project initiation
- improved notification or confirmation behavior
- reduced abandonment in multi-step flows

## Release Gate for Estimator Work

An estimator change is not release-ready unless it has:

- build verification
- visual verification
- functional verification
- mobile verification
- explicit handoff notes where the quote affects downstream project creation

## Execution Notes

- This document is a constraint file, not an automation layer.
- Use the prompt library in `Bktadvisory` to launch agent work.
- When estimator work affects broader launch behavior, publish the implications back into the main orchestration review loop.
