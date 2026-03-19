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
| `src/portal/types.ts` | TypeScript interfaces for `QuoteRecord`, `OpportunityRecord`, `ProjectRecord`, and `ActivityEvent` |
| `src/portal/mappers.ts` | Pure mapper functions — no UI dependencies |
| `src/portal/samples.ts` | Sample input (`QuoteData`) and output objects for integration testing |
| `src/portal/index.ts` | Barrel re-export for convenient imports |

---

## Mapper Functions

### `mapQuoteDataToQuoteRecord(quoteData, actor?)`

Transforms estimator `QuoteData` → `QuoteRecord`.

- Sets initial status to `"draft"`.
- Appends a `quote_generated` activity event.
- **Call site:** immediately after `calculateQuote()` completes.

### `mapQuoteToOpportunityRecord(quoteRecord)`

Creates an `OpportunityRecord` from a `QuoteRecord`.

- Sets initial stage to `"proposal"`.
- **Call site:** when the quote is first sent to a prospect (optional).

### `mapAcceptedQuoteToProjectRecord(quoteRecord, opportunity?, actor?)`

Creates a `ProjectRecord` from an accepted `QuoteRecord`.

- **Rule:** returns `null` unless `quote.status === "accepted"`.
- Appends a `project_created` activity event.
- **Call site:** when the portal marks a quote as accepted.

### `createActivityEvent(milestone, actor?, metadata?)`

Factory for individual `ActivityEvent` objects.

Supported milestones:
- `quote_generated`
- `quote_sent`
- `quote_accepted`
- `project_created`

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
                              QuoteRecord (draft)
                                   │
                         ┌─────────┴──────────┐
                         ▼                    ▼
              mapQuoteToOpportunity()   Send to prospect
              (optional)                      │
                         │                    ▼
                         ▼            ActivityEvent: quote_sent
                  OpportunityRecord           │
                                              ▼
                                    Client accepts quote
                                    ActivityEvent: quote_accepted
                                              │
                                              ▼
                                  mapAcceptedQuoteToProjectRecord()
                                              │
                                              ▼
                                        ProjectRecord
                                    ActivityEvent: project_created
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

5. **Append activity events** to records as the lifecycle progresses:
   ```ts
   quoteRecord.activity.push(
     createActivityEvent("quote_sent", "sales@bktadvisory.com", {
       recipientEmail: "client@example.com",
     })
   );
   ```

---

## Sample Data

See `src/portal/samples.ts` for a complete `QuoteData` → portal record
mapping example that can be used as a reference or in integration tests.
