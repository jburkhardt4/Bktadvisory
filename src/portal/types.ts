/**
 * Portal lifecycle record types.
 *
 * These types define the contract consumed by the Bktadvisory portal repository.
 * They are intentionally decoupled from the estimator UI so that the portal can
 * import them without pulling in React or any UI dependency.
 */

// ---------------------------------------------------------------------------
// Activity events
// ---------------------------------------------------------------------------

/** Milestone names emitted during the quote → project lifecycle. */
export type ActivityMilestone =
  | "quote_generated"
  | "quote_sent"
  | "quote_accepted"
  | "project_created";

/** A single timestamped event in a record's activity log. */
export interface ActivityEvent {
  id: string;
  milestone: ActivityMilestone;
  timestamp: string; // ISO-8601
  actor?: string; // email or user id of the person who triggered the event
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Quote record
// ---------------------------------------------------------------------------

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface QuoteRecord {
  id: string;
  status: QuoteStatus;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601

  // Contact snapshot
  contact: {
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    phone: string;
    website: string;
  };

  // Project summary
  project: {
    type: string;
    description: string;
    scopeProblems: string;
    scopeRequirements: string;
    scopeGoals: string;
    selectedCRMs: string[];
    selectedClouds: string[];
    selectedIntegrations: string[];
    selectedAITools: string[];
    additionalModules: string[];
    deliveryTeam: string;
    powerUps: string[];
  };

  // Pricing
  pricing: {
    baseHours: number;
    complexityMultiplier: number;
    adjustedHours: number;
    adminRate: number;
    developerRate: number;
    baseBlendedRate: number;
    powerUpRate: number;
    finalHourlyRate: number;
    totalCost: number;
    estimatedWeeks: number;
  };

  valueStatement?: string;

  activity: ActivityEvent[];
}

// ---------------------------------------------------------------------------
// Opportunity record (optional — created alongside certain quotes)
// ---------------------------------------------------------------------------

export type OpportunityStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export interface OpportunityRecord {
  id: string;
  quoteId: string;
  stage: OpportunityStage;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  companyName: string;
  contactEmail: string;
  estimatedValue: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Project record (created when a quote is accepted)
// ---------------------------------------------------------------------------

export type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed" | "cancelled";

export interface ProjectRecord {
  id: string;
  quoteId: string;
  opportunityId?: string;
  status: ProjectStatus;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601

  name: string;
  companyName: string;
  contactEmail: string;
  description: string;

  estimatedHours: number;
  estimatedWeeks: number;
  totalBudget: number;
  hourlyRate: number;

  deliveryTeam: string;
  powerUps: string[];

  activity: ActivityEvent[];
}
