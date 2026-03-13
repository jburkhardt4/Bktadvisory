# Critical Flows

> **Source of Truth:** All rules below derive from `GUIDELINES.md` (repo root). In any conflict, `GUIDELINES.md` governs.
> **Scope:** This file covers both applications in the BKT Advisory ecosystem.
> **Validator Output Format:** Each validation must return **Status (PASS ✅ / FAIL ❌)**, Root Cause, Recommended Fix, Acceptance Criteria, and Go / No-Go.

---

## Part 1: Main Site (`bktadvisory.com`)

### 1. Brand Identity & Hero Fidelity

**Trigger:** Any change to header components, hero sections, or icon imports.

**Rules:**
- All brand headers (`h1`, `h2`, section titles, and PDF brand headers) must strictly use color `#0F172B` (Dark Navy). No substitutes.
- Hero sections must use the exact Tailwind gradient string:
  `bg-gradient-to-r from-[#0F172B] via-slate-800 to-blue-950`
- **STRICT ICON RULE:** Zero tolerance for `lucide-react` imports. Every icon must be an inline `<svg>` component. A single `import ... from 'lucide-react'` anywhere in the PR is an automatic FAIL.

**Validation:**
- Grep for `lucide-react` — must return zero matches.
- Grep for `from-[#0F172B] via-slate-800 to-blue-950` — must be present in all hero sections.
- Grep for `#0F172B` on brand header elements (`h1`, section titles, PDF header nodes) — must match every top-level brand header across both the UI and generated PDF output.

---

### 2. Global AI Chatbot & Booking Flow

**Trigger:** Any change to chatbot response handling, booking card rendering, or AI response parsing.

**Rules:**
- The chatbot response parser must detect the `:::OPEN_BOOKING:::` sentinel tag in AI output.
- On detection, the UI must immediately render the inline Google Meet scheduling card without a full re-render of the chat shell.
- All JSON parsing and `:::OPEN_BOOKING:::` detection logic must be wrapped in a `try/catch` block so that a malformed AI response cannot crash the chat shell.
- Chatbot uses `gpt-4`. Do NOT use the deprecated OpenAI Responses API (i.e., avoid `client.responses.create()`; use `client.chat.completions.create()` instead).

**Validation:**
- Confirm `:::OPEN_BOOKING:::` detection logic is present and reachable.
- Confirm the surrounding parse block has an explicit `try/catch`.
- Simulate a malformed JSON response; chat shell must remain stable and display a graceful fallback.

---

### 3. Navigation & Responsive Layouts

**Trigger:** Any change to the global nav, quote container, or payment card layout.

**Rules:**
- Global nav must use `sticky top-0 z-50`.
- Quote Header (when rendered below the main nav) must use `sticky top-[116px] z-40`.
- **Mobile Quote Container:** Must be `w-[95%]` with `mx-auto` — never flush to the screen edge.
- **Mobile Payment Cards:** "Upfront" and "Midpoint" cards must use `grid-cols-2` to sit side-by-side on mobile. A single-column fallback is a layout regression and an automatic FAIL.

**Validation:**
- Grep for `sticky top-0 z-50` on the nav wrapper — must be present.
- Grep for `w-[95%]` and `mx-auto` on the quote container — both must be co-located.
- Grep for `grid-cols-2` on the payment card wrapper — must be present and not overridden by a responsive breakpoint that collapses to one column on mobile.

---

## Part 2: Project Estimator (`estimator.bktadvisory.com`)

### 1. AI Document Analyzer & Token-Protection Flow

**Trigger:** User uploads files (PDF, DOCX, TXT) in Step 2, or navigates Step 3 → Step 2 → Step 3.

**Rules:**
- On first upload, the system must compute and store a "signature" of the uploaded file set as a sorted, concatenated string of `filename:size` pairs (e.g., `"brief.pdf:42000|spec.docx:18500"`). This is deterministic, requires no hashing library, and is sufficient to detect any file-set change.
- The `/analyze-document` endpoint call must only fire when the current file signature differs from the stored signature.
- If the signature is unchanged, analysis results from the previous run must be reused from state — no new API call.
- All backend calls to the document analyzer must use the `/make-server-07a007e1` route prefix.

**Validation:**
- Confirm file-signature storage logic exists in state (e.g., `App.tsx` or the Step 2 component).
- Simulate Step 3 → Step 2 → Step 3 navigation without changing files; confirm `/analyze-document` is NOT called a second time (no duplicate network request).
- Simulate Step 3 → Step 2 (add/remove a file) → Step 3; confirm `/analyze-document` IS called again with the new file set.

---

### 2. Intelligent Scope & IT Infrastructure Autofill

**Trigger:** AI document analysis completes and populates scope fields (Step 3, Step 4, Step 6).

**Rules:**
- **Multi-item formatting:** When analysis returns multiple goals, problems, or requirements, they must render as a bulleted list.
- **Single-item formatting:** When analysis returns a single item, it must render as plain text with no leading bullet character.
- **Propagation chain must be intact:**
  - Step 3 (Scope): Goals, Problems, Requirements.
  - Step 4 (IT Infra): CRM selection (Salesforce / FSC), AI Tools, Integrations.
  - Step 6 (Power-Ups): Stakeholder suggestions based on technical complexity derived from Step 3–4 inputs.
- Scope Refiner uses `gpt-4o`. Do NOT use the deprecated OpenAI Responses API (i.e., avoid `client.responses.create()`; use `client.chat.completions.create()` instead).

**Validation:**
- Inject a mock multi-item analysis result; confirm bullet-list rendering in the Goals, Problems, and Requirements fields.
- Inject a mock single-item result; confirm plain-text rendering (no bullet).
- Confirm Step 4 fields (CRM, AI Tools, Integrations) are populated from the same analysis pass, not a separate API call.
- Confirm Step 6 stakeholder suggestions reflect the complexity level set in Steps 3–4.

---

### 3. Workflow Gatekeeping (Service Barrier — Step 5)

**Trigger:** User reaches Step 5 (Services) without selecting any Service Module.

**Rules:**
- The "Next" button on Step 5 must be rendered in a disabled state (`disabled` attribute or equivalent) when zero Service Modules are selected.
- The button must re-enable as soon as at least one Service Module is selected.
- No client-side workaround (e.g., hidden form submission, keyboard shortcut) may allow the user to bypass this gate.

**Validation:**
- Load Step 5 with no modules selected; confirm "Next" button is non-interactive.
- Select one module; confirm "Next" button becomes interactive.
- Attempt to advance via JavaScript console without selecting a module; the step transition logic must reject the action.

---

### 4. Triple-Action Quote Execution

**Trigger:** User clicks the final "Download Quote" button on the Quote view.

**Rules — three concurrent actions must all complete successfully:**
1. **PDF Generation:** Render the Quote UI as a PDF using `html-to-image` + `jsPDF`. Brand headers must use `#0F172B`. Approved hashed branding assets must be used (see `GUIDELINES.md` §5 Figma Asset Registry).
2. **Lead Capture:** Extract all estimator form data and push it to the "Inbound Leads" Google Sheet via the configured webhook. This must use the `/make-server-07a007e1` route prefix.
3. **Email Delivery:** Concurrently dispatch the generated PDF to both the end-user email and the owner (JB) email.

**Validation:**
- Trigger quote download and confirm all three actions fire (network tab must show PDF generation, Sheet webhook POST, and email dispatch requests).
- Confirm PDF headers render in `#0F172B`.
- Confirm `adjustedHours` and `estimatedWeeks` values in the PDF match the values displayed in the Quote UI and stored in estimator state (no drift between rendered view and document).
- Confirm the Sheet webhook uses the `/make-server-07a007e1` prefix.

---

## Deployment Protocol (Final Validation Gate)

Before the validator issues a **PASS ✅**, all of the following must be true:

### Gate 1 — Endpoint Accuracy
- All backend calls use the `/make-server-07a007e1` prefix.
- No hardcoded absolute URLs pointing to development or staging hosts remain in the PR.

### Gate 2 — Code Hygiene
- Zero `lucide-react` imports anywhere in the diff.
- No dead code, commented-out logic, or deprecated variables introduced by the PR.
- No deprecated OpenAI Responses API usage (`gpt-4` for chatbot, `gpt-4o` for scope refiner).

### Gate 3 — Mobile-First CSS
- `w-[95%]` and `mx-auto` are co-located on the quote container element.
- `grid-cols-2` is present on the payment card wrapper and is not collapsed on mobile by an overriding breakpoint.

### Gate 4 — Math Consistency
- `adjustedHours` and `estimatedWeeks` are identical across the Estimator state, the rendered Quote UI, and the generated PDF output.

### Gate 5 — Sticky Header Offsets
- Main nav: `sticky top-0 z-50` (height `h-[116px]`).
- Quote header: `sticky top-[116px] z-40`.
- No content is visually obscured by the sticky headers at any viewport size.

**Validator Final Decision:**

| Condition | Decision |
| --- | --- |
| All 5 gates pass | **PASS ✅ — Go for merge** |
| Any gate fails | **FAIL ❌ — No-Go; return root cause and fix recommendation** |
