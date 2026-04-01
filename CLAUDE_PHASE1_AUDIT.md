# CLAUDE Phase 1 Audit — BKT Advisory
**Audit Date:** 2026-04-01  
**Auditor:** Claude Code (Sonnet 4.6)  
**Mode:** Read-only architecture audit — no code modified  
**Repositories:** Bktadvisory (main site) + Bktadvisoryprojectestimator (estimator)

---

## 1. Phase 1 Executive Summary

Both repositories are largely launch-ready architecturally. The **Bktadvisory** main site has a mature auth system (admin/client role guards, retry logic, metadata fallback), 42 Vitest unit tests, and a 6-phase orchestration plan. The **estimator** is a focused single-page application with AI-driven quote generation and a clean portal mapper layer for cross-repo handoff.

**Critical blockers before launch:**
- Estimator has zero automated tests and no `.env.example`
- Playwright E2E tests are required per orchestration plan but not yet configured in either repo
- Quote-to-project handoff automation is designed but not yet verified end-to-end
- Mobile verification has no automated coverage (visual regression or Playwright mobile viewports)

---

## 2. Repository Inventory

| Property | Bktadvisory | Bktadvisoryprojectestimator |
|---|---|---|
| Path | `/workspaces/Bktadvisory/` | `/workspaces/Bktadvisory/Bktadvisoryprojectestimator/` |
| Framework | React 18 + Vite 6.4.1 | React 18 + Vite 6.3.5 |
| Language | TypeScript (strict) | TypeScript |
| Styling | Tailwind CSS v4.1.12 | Tailwind CSS v4.1.12 |
| Backend | Supabase (PostgreSQL 17) | Supabase edge functions (Hono + Deno) |
| Test runner | Vitest 4.1.0 | **None** |
| Component library | Radix UI + shadcn/ui (50+ components) | Radix UI + shadcn/ui (60+ components) |
| Auth | Supabase Auth + role guards | None (public-facing) |
| Routing | React Router (multi-route) | None (state-conditional rendering) |
| AI | OpenAI 4.73.0 (admin CRM) | OpenAI 4.86.0 (GPT-4: chat, refine, analyze) |
| Deployment | Vite build → `build/` | Vite build → `build/` |
| Supabase project | `hjrvtzkktodoxigezxqy` | `hjrvtzkktodoxigezxqy` (shared) |
| Orchestration docs | `docs/orchestration/agentic-release-plan.md`, `docs/orchestration/prompt-library.md` | `docs/orchestration/estimator-execution-constraints.md` |

---

## 3. Architecture Map

### 3a. Bktadvisory — Route Surface

```
Public (no auth):
  /           → HomePage
  /work       → WorkPage
  /services   → ServicesPage
  /process    → ProcessPage
  /about      → AboutPage
  /auth       → AuthPage (sign in / sign up)
  /estimator  → EstimatorBoundary → redirects to https://estimator.bktadvisory.com

Protected (RequireAuth):
  /portal     → PortalPage (client dashboard)

Admin-only (RequireAuth + AdminRoute):
  /portal/admin             → AdminDashboardPage
  /portal/admin/quotes      → AdminQuotesPage
  /portal/admin/projects    → AdminProjectsPage
  /portal/admin/activities  → AdminActivitiesPage
  /portal/admin/milestones  → AdminMilestonesPage
```

### 3b. Bktadvisory — Auth Data Flow

```
App mount
  → supabase.auth.getSession()   [initializes AuthContext]
  → onAuthStateChange()           [subscribes to session changes]
  → fetchProfile() with retry     [3 attempts, 250ms interval]
    → Supabase profiles table
    → On failure: fallback to app_metadata.role / user_metadata.role
  → AuthContext provides: { session, loading, role }

Route guards:
  RequireAuth: !session → /auth (with state.from preserved)
  AdminRoute:  role !== 'admin' → /portal
```

### 3c. Bktadvisory — Key Module Files

| File | Purpose |
|---|---|
| `src/contexts/AuthContext.tsx` | Session + role state, retry logic, SSO fallback |
| `src/components/RequireAuth.tsx` | Auth-only route guard |
| `src/components/AdminRoute.tsx` | Admin-role route guard |
| `src/routes.tsx` | Full route map |
| `src/supabase/client.ts` | Supabase client init (supports local/cloud env key variants) |
| `src/contexts/ThemeProvider.tsx` | next-themes wrapper, syncs `meta[theme-color]` |
| `src/contexts/PortalProfileContext.tsx` | Portal profile state (name, email, avatar, role) |
| `src/components/admin/adminCrmApi.ts` | Admin CRM API integration layer |
| `src/components/portal/portalData.ts` | Quote/Project/Milestone/Activity type definitions |
| `supabase/migrations/` | DB schema: ENUM types, RLS policies (915+ lines) |

### 3d. Estimator — Architecture

```
EstimatorAppShell (state root)
  ├── showQuote=false → Estimator (9-step form, file upload)
  │     └── AIChatbot (GPT-4 chat, autofill, scope refinement)
  │           └── Edge functions: /chat, /refine-scope, /analyze-document
  └── showQuote=true → Quote (PDF/DOCX generation, export)
        └── Edge function: /save-row (Google Sheets legacy integration)

Portal handoff layer (/src/portal/):
  mapQuoteDataToQuoteRecord()
  mapAcceptedQuoteToProjectRecord()
  → Consumed by Bktadvisory portal on quote acceptance
```

### 3e. Cross-Repo Data Flow

```
Estimator:
  User fills 9 steps
  → calculateQuote() → QuoteData
  → mapQuoteDataToQuoteRecord() → QuoteRecord
  → Portal (Bktadvisory) persists QuoteRecord to Supabase

Portal (Bktadvisory):
  Admin reviews quotes
  → mark status = "accepted"
  → mapAcceptedQuoteToProjectRecord() → ProjectRecord
  → Admin creates project from quote
  → Client sees project in /portal dashboard
```

---

## 4. Instruction File Compliance Summary

### 4a. Bktadvisory — `docs/orchestration/agentic-release-plan.md`

| Requirement | Status | Notes |
|---|---|---|
| Phase 1: Design system + mobile audit | PENDING | No evidence of completed token audit |
| Phase 2: Auth + navigation integrity | PARTIAL | Auth guards exist; Playwright E2E not yet written |
| Phase 3: Quote-to-project workflow | PARTIAL | Mapper layer exists; end-to-end not verified |
| Phase 4: Mobile UX hardening | UNKNOWN | No mobile test artifacts found |
| Phase 5: Automated verification gate | MISSING | Playwright not configured; vitest coverage incomplete |
| Phase 6: Value-add features | NOT STARTED | Expected post-launch |
| Minimum release gate (6 criteria) | PARTIAL | Unit tests pass; visual/E2E/mobile evidence absent |

**CLAUDE.md Compliance:**

| Rule | Status |
|---|---|
| Dark mode anchor: slate-950 | VERIFIED — ThemeProvider uses `#0f172a` (= slate-950) |
| Light mode anchor: slate-50 | VERIFIED — ThemeProvider uses `#f8fafc` (= slate-50) |
| `npm run typecheck && npm run lint` before complete | RULE ESTABLISHED — enforcement not yet runtime-verified |
| Plan before edits | COMPLIANT — this audit precedes any changes |
| Prefer minimal diffs | COMPLIANT — no code touched in this pass |

### 4b. Estimator — `docs/orchestration/estimator-execution-constraints.md`

| Requirement | Status | Notes |
|---|---|---|
| Scope limited to estimator UI, quote flow, mobile, document export | COMPLIANT | No portal/marketing code in repo |
| No auth implementation | COMPLIANT | Public-facing; no login required |
| Verification maturity must compensate for no test runner | FAILING | No visual evidence artifacts exist |
| Explicitly validate export/print changes | UNVERIFIED | No test artifacts found |
| Agent output must include 9 required sections | NOT ENFORCED | No audit trail of previous agent sessions |
| Surface external dependencies immediately | PARTIAL | Google Apps Script, CDN PDF.js, Google Calendar JS present but undocumented |

---

## 5. Testing and Verification Assessment

### 5a. Bktadvisory — Existing Test Coverage

| Test File | Covers |
|---|---|
| `src/__tests__/auth.test.tsx` | AuthContext init, role resolution, session hydration, redirects |
| `src/__tests__/admin-route.test.tsx` | AdminRoute guard (admin vs client role) |
| `src/__tests__/account-security.test.tsx` | AccountSecurityPanel component |
| `src/__tests__/admin-crm-api.test.ts` | CRM API integration |
| `src/__tests__/profile-utils.test.ts` | Profile name splitting/joining |
| `src/__tests__/theme-management.test.tsx` | ThemeProvider behavior |

**Missing coverage:**

| Gap | Risk | Required By |
|---|---|---|
| Playwright E2E tests (any) | HIGH | agentic-release-plan.md Phase 5 |
| Quote flow unit tests | HIGH | Release gate |
| Portal data persistence tests | HIGH | Release gate |
| Visual regression snapshots (light/dark) | HIGH | Release gate |
| Mobile viewport tests (375px, 768px) | MEDIUM | Phase 4 mobile hardening |
| Admin portal CRUD tests | MEDIUM | Release gate |
| Full route protection integration tests | MEDIUM | Phase 2 |

### 5b. Estimator — Existing Test Coverage

**None.** No test files, no test runner, no test scripts in `package.json`.

**Missing coverage:**

| Gap | Risk |
|---|---|
| Any test file at all | CRITICAL |
| Quote calculation unit tests | CRITICAL |
| Portal mapper unit tests | HIGH |
| PDF/DOCX export functional tests | HIGH |
| AI endpoint mock/integration tests | HIGH |
| Visual verification screenshots | HIGH |
| Mobile layout tests | MEDIUM |

### 5c. Minimum Practical Release Gate

**Bktadvisory:**
- [ ] `npm run typecheck` passes clean
- [ ] `npm run lint` passes clean
- [ ] `npm run build` succeeds
- [ ] `npm test` (vitest) passes all 42+ test files
- [ ] Playwright: sign in → `/portal` → project view (happy-path)
- [ ] Playwright: non-admin redirect from `/portal/admin`
- [ ] Visual screenshots: marketing home, portal, admin dashboard (light + dark)
- [ ] Mobile screenshots: 375px and 768px viewports

**Estimator:**
- [ ] `npm run build` succeeds
- [ ] Manual walkthrough: 9 steps → quote generated → PDF download
- [ ] Manual walkthrough: AI chatbot → autofill → verify form fields populated
- [ ] Visual screenshots: steps 1, 4, 7 (final quote) at mobile and desktop
- [ ] Portal mapper unit tests: `mapQuoteDataToQuoteRecord` + `mapAcceptedQuoteToProjectRecord`

---

## 6. Architecture & Testing Launch Blockers

| # | Blocker | Repo | Severity | Phase |
|---|---|---|---|---|
| B1 | No Playwright E2E tests configured | Bktadvisory | CRITICAL | Phase 5 |
| B2 | No test suite in estimator repo | Estimator | CRITICAL | Phase 5 |
| B3 | Quote-to-project end-to-end flow unverified | Both | HIGH | Phase 3 |
| B4 | No visual regression artifacts (light/dark/mobile) | Both | HIGH | Release gate |
| B5 | `.env.example` missing in both repos | Both | MEDIUM | Ops |
| B6 | No React Error Boundary in either repo | Both | MEDIUM | Reliability |
| B7 | PDF.js worker loaded from unpkg CDN | Estimator | MEDIUM | Reliability |
| B8 | Google Apps Script URL hardcoded (no rotation path) | Estimator | MEDIUM | Security |
| B9 | Playwright referenced in orchestration docs but absent from `package.json` | Bktadvisory | HIGH | Phase 5 |
| B10 | Admin CRM API not covered by RLS audit evidence | Bktadvisory | MEDIUM | Auth integrity |
| B11 | Quote ID generated client-side (no persistent UUID strategy) | Estimator | MEDIUM | Data integrity |
| B12 | Tailwind design tokens not formalized (v4 zero-config) | Both | LOW | Phase 1 |

---

## 7. Exact Next Action

### Immediate (Phase 1 completion)
1. Run `npm run typecheck && npm run build` in both repos — confirm no errors
2. Add Playwright to Bktadvisory: `npm install -D @playwright/test && npx playwright install`
3. Write Playwright test: sign in → `/portal` happy path + admin redirect rejection
4. Create estimator portal mapper unit tests (vitest): `mapQuoteDataToQuoteRecord` + `mapAcceptedQuoteToProjectRecord`
5. Generate `.env.example` for both repos (placeholder values only)
6. Capture visual screenshots: marketing home, portal, admin dashboard, estimator steps 1/4/7 — light + dark mode

### Then Phase 2 (Auth + Navigation)
- Trace full sign-in flow: Supabase → AuthContext → RequireAuth → portal
- Verify sign-out clears session and redirects to `/`
- Test token refresh behavior (1-hour JWT expiry per `supabase/config.toml`)
- Verify SSO metadata fallback when `profiles` table is slow

---

## VERIFIED vs ASSUMED

### VERIFIED (observed directly in source)

- Auth guards exist in `RequireAuth.tsx` and `AdminRoute.tsx` with correct redirect logic
- Role resolution has 3-attempt retry with 250ms intervals and metadata fallback
- Supabase migrations include RLS policies for quotes, projects, profiles, avatars
- ThemeProvider uses `next-themes` with `attribute: "class"` and slate-950/slate-50 anchors
- EstimatorBoundary redirects to `https://estimator.bktadvisory.com` after 1 second
- Portal mapper layer (`/src/portal/`) is pure functions with no React/UI dependencies
- 42 Vitest test files exist covering auth, admin routes, theme, profile utils
- Estimator has zero test files of any kind
- Both repos share Supabase project `hjrvtzkktodoxigezxqy`
- Estimator uses Hono edge functions for 4 AI/integration endpoints
- Edge functions require `OPENAI_API_KEY` via `Deno.env.get()` (not committed to source)
- Both repos use Tailwind CSS v4.1.12 (zero-config, no `tailwind.config.ts`)
- Both repos output to `build/` via Vite
- Both dev servers configured for port 5000, host `0.0.0.0` (Codespaces-friendly)

### ASSUMED (inferred, not directly tested)

- The 42 Vitest tests currently pass (not executed in this pass)
- `npm run build` succeeds in both repos (not executed in this pass)
- Supabase RLS policies correctly restrict client access to own data (not query-tested)
- Portal QuoteRecord consumption in Bktadvisory is wired up to the estimator mapper output (end-to-end not traced)
- Estimator is deployed to `https://estimator.bktadvisory.com` as a static SPA
- OpenAI API key is set in Supabase edge function secrets (not verified)
- Google Apps Script endpoint is accessible and correctly receives quote data
- All 50+ Radix UI component aliases in `vite.config.ts` are correctly resolving at build time

---

## DO NOT TOUCH YET

The following areas must not be modified until their Phase is active and release gate criteria are met:

| Area | Reason | Owner Phase |
|---|---|---|
| `src/contexts/AuthContext.tsx` | Core auth logic — any change affects all protected routes | Phase 2 |
| `supabase/migrations/` | Schema changes require coordinated migration + RLS audit | Phase 2 / Phase 3 |
| `src/components/EstimatorBoundary.tsx` | Cross-repo redirect — requires validating estimator deployment URL | Phase 2 |
| Portal mapper layer (`/src/portal/`) in estimator | Integration contract — Bktadvisory must update consumption code in sync | Phase 3 |
| Quote calculation logic in `Estimator.tsx` | Revenue-critical — requires manual quote verification test | Phase 3 |
| `supabase/functions/server/index.tsx` (estimator) | AI endpoint logic — requires functional validation of all 4 endpoints | Phase 3 |
| `src/components/admin/adminCrmApi.ts` | Untested CRM integration — needs RLS audit first | Phase 3 |
| `src/supabase/client.ts` | Client init affects all Supabase calls — touch only with full auth flow trace | Phase 2 |
| Google Apps Script integration URL | Hardcoded endpoint — rotation plan needed before any URL changes | Phase 3 |
| PDF.js CDN worker reference | CDN dependency — evaluate self-hosting before removing | Phase 4 |
