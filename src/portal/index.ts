/**
 * Barrel export for the portal integration layer.
 *
 * Consumers can import everything from `src/portal`:
 *
 *   import { mapQuoteDataToQuoteRecord, QuoteRecord } from "./portal";
 */

export type {
  ActivityEvent,
  ActivityEventType,
  ProjectRecord,
  ProjectStatus,
  QuoteRecord,
  QuoteStatus,
} from "./types";

export {
  createActivityEvent,
  mapAcceptedQuoteToProjectRecord,
  mapQuoteDataToQuoteRecord,
} from "./mappers";
