# BKT Advisory — Claude Code Operating Rules

## Stack

- React (Vite)
- TypeScript
- Tailwind CSS v4
- Supabase
- GitHub Codespaces

## Release priorities

1. Authentication and protected routes
2. Estimator accuracy and UX
3. Quote-to-project automation
4. Client/Admin portal integrity
5. Mobile responsiveness
6. Automated testing stability

## Working style

- Start with a plan before edits.
- Prefer minimal diffs over large refactors.
- Preserve existing architecture unless a change is explicitly justified.
- Name affected files before editing them.
- Always state verification steps.

## UI rules

- Dark mode anchors: slate-950 family
- Light mode anchors: slate-50 family
- Maintain design consistency across marketing, estimator, client, and admin surfaces
- Validate phone-size layouts after UI changes

## Mandatory execution rule

- Before marking a task complete, you must autonomously run npm run typecheck && npm run lint using your bash tool. If errors exist, read the terminal output and fix them without human prompting.

## Required verification

- npm run typecheck
- npm run lint
- npm run build
- relevant Playwright or smoke tests
- visual verification in Codespaces preview

## Never do

- Do not silently rewrite large sections of the app
- Do not change auth or database behavior without tracing the full flow
- Do not introduce new dependencies without justification
