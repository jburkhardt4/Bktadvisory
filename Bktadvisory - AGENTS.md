Bktadvisory - AGENTS.md

# AGENTS.md — BKT Advisory Main Site

You are working in the BKT Advisory Marketing Platform repository.

## Mission
Preserve and improve the front-end marketing site while maintaining exact visual fidelity to Figma, stable portfolio routing, and safe integration with shared backend/chatbot services.

## Non-Negotiable Boundaries
- This repo is for the marketing site only.
- Do not implement or move Project Estimator state logic, quote generation, PDF/DOCX generation, or Salesforce infrastructure mapping into this repo.
- If backend calls are used, the only valid route prefix is `/make-server-07a007e1`.
- Do not use deprecated backend prefixes.

## Required Workflow Before Any Change
1. Read `GUIDELINES.md`.
2. Inspect changed files and identify whether the task affects:
   - navigation
   - CTA buttons
   - chatbot shell
   - portfolio/static content
   - responsive layout
3. Check for visual drift against Figma.
4. Make the smallest safe change.
5. Self-validate before concluding.

## Self-Validation Requirements
- Confirm Vite builds cleanly with no terminal/runtime crashes.
- Verify hero gradients render correctly:
  - `from-[#0F172B] via-slate-800 to-blue-950`
- Verify sticky navigation `sticky top-0 z-50` does not obscure mobile content.
- Verify Google Calendar scheduler scripts load without CORS issues.
- Verify visual spacing, padding, and typography against Figma.
- Explicitly inspect desktop and mobile layouts.

## UI and Code Rules
- Use React + TypeScript + Vite patterns already present in the repo.
- Preserve the existing modern, tech-forward aesthetic.
- Use deep navy, slate, blue, and indigo accents consistently.
- Do not introduce aggressive motion.
- Prefer subtle fade/slide entrance effects only when already consistent with the design.
- Do not override global typography settings unless specifically required.

## Icon Rule
- Do not import or use `lucide-react`.
- Use inline SVG components only.
- If `lucide-react` is present in the codebase, treat it as legacy drift and remove or replace it when touching affected components.

## Component-Specific Guardrails
### Navigation
- Preserve sticky behavior: `sticky top-0 z-50`
- Maintain correct conditional logo rendering for desktop vs mobile assets.

### ScheduleCallButton
- Treat this as the shared CTA component.
- If booking URLs change, verify `window.calendar.schedulingButton.load()` still initializes correctly.

### AIChatbot UI Shell
- Keep it persistent and globally accessible.
- Backend chat model remains standard OpenAI chat completions via Supabase, not the deprecated Responses API.
- Any parsing of hidden booking tags like `:::OPEN_BOOKING:::` must be safely wrapped in try/catch.

## Output Expectations
When reviewing or validating a change, return:
- PASS or FAIL
- root cause if failed
- prioritized issue list
- exact fix recommendation
- acceptance criteria
- go/no-go recommendation
