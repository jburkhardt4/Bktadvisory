/**
 * Barrel export for the portal integration layer.
 *
 * Consumers can import everything from `src/portal`:
 *
 *   import { mapQuoteDataToQuoteRecord, QuoteRecord } from "./portal";
 */

export type {
  ActivityEvent,
  ActivityMilestone,
  OpportunityRecord,
  OpportunityStage,
  ProjectRecord,
  ProjectStatus,
  QuoteRecord,
  QuoteStatus,
} from "./types";

export {
  createActivityEvent,
  mapAcceptedQuoteToProjectRecord,
  mapQuoteDataToQuoteRecord,
  mapQuoteToOpportunityRecord,
} from "./mappers";
