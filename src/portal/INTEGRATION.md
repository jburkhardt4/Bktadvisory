# Portal Integration Notes

> How the **Bktadvisory** portal repository consumes data from this estimator.

---

## Overview

The estimator emits `QuoteData` objects when a user completes the estimation
flow (via `calculateQuote()` → `onGenerateQuote()`). A set of pure mapper
functions in `src/portal/` transforms that output into lifecycle-aware records
that the portal can persist and manage.

**No changes were made to the estimator's UI or quote-generation flow.**

---

## Files

| File | Purpose |
|---|---|
| `src/portal/types.ts` | TypeScript interfaces for `QuoteRecord`, `OpportunityRecord`, `ProjectRecord`, and `ActivityEvent` — mirrors the canonical lifecycle model from `Bktadvisory/src/types/portal.ts` |
| `src/portal/mappers.ts` | Pure mapper functions — no UI dependencies |
| `src/portal/samples.ts` | Sample input (`QuoteData`) and output objects for integration testing |
| `src/portal/index.ts` | Barrel re-export for convenient imports |

---

## Visibility Rules

- **QuoteRecord** and **ProjectRecord** are client-facing (visible in Client Portal).
- **OpportunityRecord** is internal-only (BKT Advisory admin pipeline) — NEVER exposed to end-users.
- The Client Portal provides a secure, read-only dashboard — status flows one-way from admin to client.

---

## Mapper Functions

### `mapQuoteDataToQuoteRecord(quoteData)`

Transforms estimator `QuoteData` → `QuoteRecord`.

- Sets initial status to `"quoted"` (the quote has been generated at Step 7).
- **Call site:** immediately after `calculateQuote()` completes.

### `mapQuoteToOpportunityRecord(quoteRecord)`

Creates an `OpportunityRecord` from a `QuoteRecord`.

- Sets initial status to `"proposal_prepared"`.
- **Internal-only:** this record is never exposed to the Client Portal.
- **Call site:** when the quote is first sent to a prospect (optional).

### `mapAcceptedQuoteToProjectRecord(quoteRecord, actor?)`

Creates a `ProjectRecord` from an accepted `QuoteRecord`.

- **Rule:** returns `null` unless `quote.status === "accepted"`.
- Sets initial status to `"intake"`.
- **Call site:** when the portal marks a quote as accepted.

### `createActivityEvent(type, recordId, description, actor)`

Factory for individual `ActivityEvent` objects.

Supported event types (canonical):
- `quote_generated`
- `quote_sent`
- `quote_revised`
- `quote_accepted`
- `project_created`
- `discovery_completed`
- `scope_approved`
- `design_started`
- `build_started`
- `client_feedback_requested`
- `client_feedback_received`
- `blocked`
- `unblocked`
- `uat_started`
- `completed`
- `archived`

---

## Estimator Step → Quote Lifecycle Mapping

| Estimator Step | Quote Status |
|---|---|
| Step 1 (Contact Info) | `draft` |
| Steps 2–6 (Upload Docs, Scope, IT Infrastructure, Services, Team & Extras) | `scoping` |
| Step 7 (Get Quote / Generated Quote) | `quoted` |
| Step 8 (Download & Send Quote) | `sent` |
| Step 9 (Resolution) | `accepted` / `declined` / `expired` |

---

## Lifecycle Flow

```
Estimator (this repo)              Portal (Bktadvisory repo)
─────────────────────              ─────────────────────────
calculateQuote()
       │
       ▼
  QuoteData ──────────►  mapQuoteDataToQuoteRecord()
                                   │
                                   ▼
                              QuoteRecord (quoted)
                                   │
                         ┌─────────┴──────────┐
                         ▼                    ▼
              mapQuoteToOpportunity()   Send to prospect
              (internal-only)                 │
                         │                    ▼
                         ▼            Status → sent
                  OpportunityRecord           │
                  (proposal_prepared)         ▼
                                    Client accepts quote
                                    Status → accepted
                                              │
                                              ▼
                                  mapAcceptedQuoteToProjectRecord()
                                              │
                                              ▼
                                        ProjectRecord
                                        (intake)
```

---

## What the Portal Must Consume

The **Bktadvisory** portal repository should:

1. **Import the types** from this repo (or copy the type definitions):
   ```ts
   import type {
     QuoteRecord,
     OpportunityRecord,
     ProjectRecord,
     ActivityEvent,
   } from "@bktadvisory/project-estimator/portal";
   ```

2. **Import the mapper functions** (or replicate them):
   ```ts
   import {
     mapQuoteDataToQuoteRecord,
     mapQuoteToOpportunityRecord,
     mapAcceptedQuoteToProjectRecord,
     createActivityEvent,
   } from "@bktadvisory/project-estimator/portal";
   ```

3. **Persist the records** using its own storage layer (Supabase, etc.).

4. **Replace the ID generator** (`generateId`) with a production-grade
   strategy (e.g. UUID v4 or database-generated IDs).

5. **Persist activity events** in a separate `activity_events` table (or
   equivalent), keyed by `recordId` as a foreign key. The `recordId` field
   is entity-agnostic — it may reference a quote, project, or any other
   record. Activity events are appended as the lifecycle progresses:
   ```ts
   const event = createActivityEvent(
     "quote_sent",
     quoteRecord.id,
     "Quote sent to client@example.com",
     "sales@bktadvisory.com",
   );
   // Persist `event` to the activity_events table
   ```

---

## Sample Data

See `src/portal/samples.ts` for a complete `QuoteData` → portal record
mapping example that can be used as a reference or in integration tests.
