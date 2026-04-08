/**
 * Quote lifecycle: tracks a quote from initial draft through acceptance or expiry.
 * - draft: quote is being prepared
 * - scoping: requirements are being gathered
 * - quoted: quote has been generated
 * - sent: quote has been delivered to client
 * - revision_requested: client has asked for changes
 * - accepted: client accepted the quote
 * - declined: client declined the quote
 * - expired: quote passed its validity window
 */
export type QuoteStatus =
  | 'draft'
  | 'scoping'
  | 'quoted'
  | 'sent'
  | 'revision_requested'
  | 'accepted'
  | 'declined'
  | 'expired';

/**
 * Project lifecycle: tracks an active engagement from intake through archival.
 * - intake: project is being onboarded
 * - discovery: requirements and context are being gathered
 * - scoping: full scope is being defined
 * - design_in_progress: solution design is underway
 * - build_in_progress: development or implementation is active
 * - awaiting_client: blocked pending client input or approval
 * - blocked: blocked by an internal or external dependency
 * - uat: client is performing user acceptance testing
 * - completed: all deliverables have been accepted
 * - archived: project is closed and archived for record-keeping
 */
export type ProjectStatus =
  | 'intake'
  | 'discovery'
  | 'scoping'
  | 'design_in_progress'
  | 'build_in_progress'
  | 'awaiting_client'
  | 'blocked'
  | 'uat'
  | 'completed'
  | 'archived';

/**
 * Activity event types: discrete events recorded in the project activity feed.
 */
export type ActivityEventType =
  | 'quote_generated'
  | 'quote_sent'
  | 'quote_revised'
  | 'quote_accepted'
  | 'project_created'
  | 'discovery_completed'
  | 'scope_approved'
  | 'design_started'
  | 'build_started'
  | 'client_feedback_requested'
  | 'client_feedback_received'
  | 'blocked'
  | 'unblocked'
  | 'uat_started'
  | 'completed'
  | 'archived';

/** Canonical record for a quote in the client portal. */
export interface QuoteRecord {
  id: string;
  clientName: string;
  companyName: string;
  amount: number;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
}

/** Canonical record for an active or historical project. */
export interface ProjectRecord {
  id: string;
  name: string;
  companyName: string;
  status: ProjectStatus;
  owner: string;
  targetMilestone: string;
  createdAt: string;
  updatedAt: string;
}

/** A single entry in the project activity feed. */
export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  projectId: string;
  description: string;
  timestamp: string;
  actor: string;
}
