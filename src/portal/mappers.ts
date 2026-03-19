/**
 * Mapper functions that transform estimator QuoteData into portal lifecycle records.
 *
 * These functions are pure (no side-effects, no UI imports) so they can be
 * consumed by both the estimator repo and the Bktadvisory portal repo.
 */

import type { QuoteData } from "../types";
import type {
  ActivityEvent,
  ActivityMilestone,
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
 * Create a placeholder activity event for a lifecycle milestone.
 *
 * @param milestone - one of the predefined lifecycle milestones
 * @param actor     - (optional) email or user id of the person triggering the event
 * @param metadata  - (optional) arbitrary context for the event
 */
export function createActivityEvent(
  milestone: ActivityMilestone,
  actor?: string,
  metadata?: Record<string, unknown>,
): ActivityEvent {
  return {
    id: generateId("evt"),
    milestone,
    timestamp: nowISO(),
    ...(actor !== undefined && { actor }),
    ...(metadata !== undefined && { metadata }),
  };
}

// ---------------------------------------------------------------------------
// QuoteRecord mapper
// ---------------------------------------------------------------------------

/**
 * Transform estimator `QuoteData` into a portal `QuoteRecord`.
 *
 * The resulting record has status `"draft"` and an initial `quote_generated`
 * activity event.  The caller can later update the status and append events
 * as the quote moves through its lifecycle.
 *
 * @param quoteData - output from the estimator's `calculateQuote` function
 * @param actor     - (optional) email of the user who generated the quote
 */
export function mapQuoteDataToQuoteRecord(
  quoteData: QuoteData,
  actor?: string,
): QuoteRecord {
  const now = nowISO();
  const { formData } = quoteData;

  return {
    id: generateId("quote"),
    status: "draft" as QuoteStatus,
    createdAt: now,
    updatedAt: now,

    contact: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      companyName: formData.companyName,
      email: formData.workEmail,
      phone: formData.mobilePhone,
      website: formData.website,
    },

    project: {
      type: formData.projectType,
      description: formData.projectDescription,
      scopeProblems: formData.scopeProblems,
      scopeRequirements: formData.scopeRequirements,
      scopeGoals: formData.scopeGoals,
      selectedCRMs: [...formData.selectedCRMs],
      selectedClouds: [...formData.selectedClouds],
      selectedIntegrations: [...formData.selectedIntegrations],
      selectedAITools: [...formData.selectedAITools],
      additionalModules: [...formData.additionalModules],
      deliveryTeam: formData.deliveryTeam,
      powerUps: [...formData.powerUps],
    },

    pricing: {
      baseHours: quoteData.baseHours,
      complexityMultiplier: quoteData.complexityMultiplier,
      adjustedHours: quoteData.adjustedHours,
      adminRate: quoteData.adminRate,
      developerRate: quoteData.developerRate,
      baseBlendedRate: quoteData.baseBlendedRate,
      powerUpRate: quoteData.powerUpRate,
      finalHourlyRate: quoteData.finalHourlyRate,
      totalCost: quoteData.totalCost,
      estimatedWeeks: quoteData.estimatedWeeks,
    },

    valueStatement: formData.valueStatement,

    activity: [createActivityEvent("quote_generated", actor)],
  };
}

// ---------------------------------------------------------------------------
// OpportunityRecord mapper (optional)
// ---------------------------------------------------------------------------

/**
 * Create an `OpportunityRecord` from a `QuoteRecord`.
 *
 * An opportunity is optional and is typically created when a quote is first
 * sent to a prospect.  The caller decides when to invoke this mapper.
 *
 * @param quote - the portal `QuoteRecord` to derive the opportunity from
 */
export function mapQuoteToOpportunityRecord(
  quote: QuoteRecord,
): OpportunityRecord {
  const now = nowISO();

  return {
    id: generateId("opp"),
    quoteId: quote.id,
    stage: "proposal",
    createdAt: now,
    updatedAt: now,
    companyName: quote.contact.companyName,
    contactEmail: quote.contact.email,
    estimatedValue: quote.pricing.totalCost,
    description: quote.project.description,
  };
}

// ---------------------------------------------------------------------------
// ProjectRecord mapper
// ---------------------------------------------------------------------------

/**
 * Rule: a `ProjectRecord` is created **only** when a quote reaches the
 * `"accepted"` status.  This function encodes that rule.
 *
 * @param quote       - the accepted `QuoteRecord`
 * @param opportunity - (optional) linked opportunity
 * @param actor       - (optional) email of the user who accepted the quote
 * @returns a new `ProjectRecord` or `null` if the quote is not accepted
 */
export function mapAcceptedQuoteToProjectRecord(
  quote: QuoteRecord,
  opportunity?: OpportunityRecord,
  actor?: string,
): ProjectRecord | null {
  // Rule: only accepted quotes produce a project record.
  if (quote.status !== "accepted") {
    return null;
  }

  const now = nowISO();
  const { contact, project, pricing } = quote;

  return {
    id: generateId("proj"),
    quoteId: quote.id,
    opportunityId: opportunity?.id,
    status: "planning",
    createdAt: now,
    updatedAt: now,

    name: `${contact.companyName} – ${project.type}`,
    companyName: contact.companyName,
    contactEmail: contact.email,
    description: project.description,

    estimatedHours: pricing.adjustedHours,
    estimatedWeeks: pricing.estimatedWeeks,
    totalBudget: pricing.totalCost,
    hourlyRate: pricing.finalHourlyRate,

    deliveryTeam: project.deliveryTeam,
    powerUps: [...project.powerUps],

    activity: [createActivityEvent("project_created", actor)],
  };
}
