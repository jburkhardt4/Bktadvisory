Bktadvisoryprojectestimator - AGENTS.md

# AGENTS.md — BKT Advisory Project Estimator

You are working in the BKT Advisory Tech Project Estimator repository.

## Mission
Protect the estimator’s complex state logic, AI-assisted scope refinement, quote calculation integrity, and PDF/DOCX generation pipeline while keeping UI aligned to Figma across desktop and mobile.

## Non-Negotiable Boundaries
- This repo is a single-page estimator application.
- Do not implement route-based page architecture for estimator vs quote views.
- The app must switch between views using `showQuote` state in `App.tsx`.
- Do not move marketing-site copy or portfolio components into this repo.
- All backend route prefixes must use `/make-server-07a007e1`.

## Required Workflow Before Any Change
1. Read `GUIDELINES.md`.
2. Identify whether the task affects:
   - estimator step flow
   - AI endpoints
   - quote calculations
   - PDF generation
   - DOCX parsing/generation
   - Supabase calls
   - sticky headers
   - mobile layout
3. Trace impacted state in `App.tsx` and downstream components.
4. Make the smallest safe change.
5. Self-validate with both visual and functional checks.

## Self-Validation Requirements
- Verify endpoint prefix remains `/make-server-07a007e1`.
- Verify `adjustedHours` and `estimatedWeeks` stay mathematically consistent anywhere quote logic is touched.
- Verify chatbot JSON parsing and booking-card detection are wrapped safely in try/catch.
- Verify Supabase Edge Function behavior tolerates CORS and gracefully handles `429 Too Many Requests`.
- Verify estimator and quote headers preserve sticky offsets:
  - main nav: `sticky top-0 z-50 h-[116px]`
  - quote header: `sticky top-[116px] z-40`
- Verify desktop and mobile layout fidelity against Figma.

## Critical Functional Rules
- If document upload analysis populates scope fields, regression from Step 3 back to Step 2 and then forward again must not redundantly rerun analysis unless the uploaded file set changed.
- Quote generation must preserve consistency across:
  - estimator state
  - rendered quote UI
  - PDF output
  - downstream integrations
- AI autofill must map uploaded docs, scope fields, and generated project description into the correct downstream fields.

## Stack Rules
- Use React + TypeScript patterns already present.
- Use inline SVG icons only.
- Do not use deprecated OpenAI Responses API.
- Chatbot uses `gpt-4`.
- Scope refiner uses `gpt-4o`.
- Preserve existing PDF and DOCX generation approach unless explicitly replacing it end-to-end.

## Asset Rules
Use only approved hashed branding assets for:
- desktop logo
- mobile shield
- John Burkhardt profile image
- signature image

Do not substitute branding assets casually.

## Output Expectations
When reviewing or validating a change, return:
- PASS or FAIL
- root cause
- prioritized issue list
- exact code-level fix recommendation
- acceptance criteria
- release go/no-go
