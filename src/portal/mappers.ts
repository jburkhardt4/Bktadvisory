/**
 * Mapper functions that transform estimator QuoteData into portal lifecycle records.
 *
 * These functions are pure (no side-effects, no UI imports) so they can be
 * consumed by both the estimator repo and the Bktadvisory portal repo.
 *
 * Visibility rules:
 * - QuoteRecord and ProjectRecord are client-facing (visible in Client Portal).
 * - OpportunityRecord is internal-only (BKT Advisory admin pipeline).
 * - The Client Portal provides a secure, read-only dashboard — status flows
 *   one-way from admin to client.
 */

import type { QuoteData } from "../types";
import type {
  ActivityEvent,
  ActivityEventType,
  OpportunityRecord,
  ProjectRecord,
  QuoteRecord,
  QuoteStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a unique ID. In production the portal should replace this with its own ID strategy (e.g. database-generated IDs). */
function generateId(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
  return `${prefix}_${uuid}`;
}

/** Return the current time as an ISO-8601 string. */
function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Activity event factory
// ---------------------------------------------------------------------------

/**
 * Create an activity event for a lifecycle milestone.
 *
 * @param type        - one of the canonical activity event types
 * @param recordId    - the quote, project, or other record this event belongs to
 * @param description - human-readable description of the event
 * @param actor       - email or user id of the person who triggered the event
 */
export function createActivityEvent(
  type: ActivityEventType,
  recordId: string,
  description: string,
  actor: string,
): ActivityEvent {
  return {
    id: generateId("evt"),
    type,
    recordId,
    description,
    timestamp: nowISO(),
    actor,
  };
}

// ---------------------------------------------------------------------------
// QuoteRecord mapper
// ---------------------------------------------------------------------------

/**
 * Estimator step → Quote lifecycle mapping:
 *   Step 1 (Contact Info)           → draft
 *   Steps 2–6 (Scope/Config)       → scoping
 *   Step 7 (Get Quote / Generated)  → quoted
 *   Step 8 (Download & Send Quote)  → sent
 *   Step 9 (Resolution)            → accepted / declined / expired
 */

/**
 * Transform estimator `QuoteData` into a portal `QuoteRecord`.
 *
 * The resulting record has status `"quoted"` (the quote has been generated).
 * The caller can later update the status and append activity events as the
 * quote moves through its lifecycle.
 *
 * @param quoteData - output from the estimator's `calculateQuote` function
 */
export function mapQuoteDataToQuoteRecord(
  quoteData: QuoteData,
): QuoteRecord {
  const now = nowISO();
  const { formData } = quoteData;
  const id = generateId("quote");

  return {
    id,
    clientName: `${formData.firstName} ${formData.lastName}`,
    companyName: formData.companyName,
    amount: quoteData.totalCost,
    status: "quoted" as QuoteStatus,
    createdAt: now,
    updatedAt: now,
    description: formData.projectDescription,
  };
}

// ---------------------------------------------------------------------------
// OpportunityRecord mapper (internal-only — NEVER exposed to Client Portal)
// ---------------------------------------------------------------------------

/**
 * Create an `OpportunityRecord` from a `QuoteRecord`.
 *
 * An opportunity is internal-only and is typically created when a quote is
 * first sent to a prospect. The caller decides when to invoke this mapper.
 * This data must NEVER be exposed or rendered in the Client Portal UI.
 *
 * @param quote - the portal `QuoteRecord` to derive the opportunity from
 */
export function mapQuoteToOpportunityRecord(
  quote: QuoteRecord,
): OpportunityRecord {
  const now = nowISO();

  return {
    id: generateId("opp"),
    name: `${quote.companyName} – Opportunity`,
    companyName: quote.companyName,
    status: "proposal_prepared",
    value: quote.amount,
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// ProjectRecord mapper
// ---------------------------------------------------------------------------

/**
 * Rule: a `ProjectRecord` is created **only** when a quote reaches the
 * `"accepted"` status. This function encodes that rule.
 *
 * @param quote       - the accepted `QuoteRecord`
 * @param actor       - (optional) email of the user who accepted the quote
 * @returns a new `ProjectRecord` or `null` if the quote is not accepted
 */
export function mapAcceptedQuoteToProjectRecord(
  quote: QuoteRecord,
  actor?: string,
): ProjectRecord | null {
  // Rule: only accepted quotes produce a project record.
  if (quote.status !== "accepted") {
    return null;
  }

  const now = nowISO();

  return {
    id: generateId("proj"),
    name: `${quote.companyName} – Project`,
    companyName: quote.companyName,
    status: "intake",
    owner: actor ?? "system",
    targetMilestone: "",
    createdAt: now,
    updatedAt: now,
  };
}
