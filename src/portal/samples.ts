/**
 * Sample input/output objects that demonstrate the mapper contract.
 *
 * These samples serve as documentation and can be used by the Bktadvisory
 * portal repo for integration testing.
 */

import type { QuoteData } from "../types";
import type {
  ActivityEvent,
  OpportunityRecord,
  ProjectRecord,
  QuoteRecord,
} from "./types";

// ---------------------------------------------------------------------------
// Sample estimator output (QuoteData)
// ---------------------------------------------------------------------------

export const sampleQuoteData: QuoteData = {
  formData: {
    firstName: "Jane",
    lastName: "Doe",
    companyName: "Acme Corp",
    website: "https://acme.com",
    workEmail: "jane.doe@acme.com",
    mobilePhone: "+1-555-0100",

    projectType: "custom",
    projectDescription:
      "Salesforce CRM implementation with Slack integration and AI-powered analytics.",
    scopeProblems: "Manual lead tracking, fragmented communication across teams.",
    scopeRequirements:
      "Unified CRM, Slack notifications for deal updates, AI dashboards.",
    scopeGoals:
      "Reduce lead response time by 50%, consolidate reporting into one platform.",
    selectedCRMs: ["Salesforce"],
    selectedClouds: ["Sales Cloud", "Service Cloud"],
    selectedIntegrations: ["Slack", "GitHub"],
    selectedAITools: ["OpenAI"],
    additionalModules: ["Reporting & Dashboards", "Workflow Automation"],
    deliveryTeam: "nearshore",
    powerUps: ["Project Manager", "Solutions Architect"],
    uploadedFiles: [],
    valueStatement:
      "By consolidating your CRM and communication tools, your team can respond to leads 50% faster while reducing manual overhead.",
  },
  baseHours: 200,
  complexityMultiplier: 1.05,
  adjustedHours: 210,
  adminRate: 55,
  developerRate: 70,
  baseBlendedRate: 64,
  powerUpRate: 13,
  finalHourlyRate: 77,
  totalCost: 16170,
  estimatedWeeks: 6,
};

// ---------------------------------------------------------------------------
// Sample portal records (expected mapper output shapes)
// ---------------------------------------------------------------------------

export const sampleQuoteRecord: QuoteRecord = {
  id: "quote_sample_abc123_1",
  clientName: "Jane Doe",
  companyName: "Acme Corp",
  amount: 16170,
  status: "quoted",
  createdAt: "2026-03-19T00:00:00.000Z",
  updatedAt: "2026-03-19T00:00:00.000Z",
  description:
    "Salesforce CRM implementation with Slack integration and AI-powered analytics.",
};

export const sampleActivityEvents: ActivityEvent[] = [
  {
    id: "evt_sample_001",
    type: "quote_generated",
    recordId: "quote_sample_abc123_1",
    description: "Quote generated for Acme Corp",
    timestamp: "2026-03-19T00:00:00.000Z",
    actor: "jane.doe@acme.com",
  },
  {
    id: "evt_sample_002",
    type: "quote_sent",
    recordId: "quote_sample_abc123_1",
    description: "Quote sent to jane.doe@acme.com",
    timestamp: "2026-03-19T01:00:00.000Z",
    actor: "sales@bktadvisory.com",
  },
  {
    id: "evt_sample_003",
    type: "quote_accepted",
    recordId: "quote_sample_abc123_1",
    description: "Quote accepted by client",
    timestamp: "2026-03-20T14:30:00.000Z",
    actor: "jane.doe@acme.com",
  },
  {
    id: "evt_sample_004",
    type: "project_created",
    recordId: "proj_sample_ghi012_1",
    description: "Project created from accepted quote",
    timestamp: "2026-03-20T14:30:01.000Z",
    actor: "system",
  },
];

/** Sample opportunity record (internal-only — not client-facing). */
export const sampleOpportunityRecord: OpportunityRecord = {
  id: "opp_sample_def456_1",
  name: "Acme Corp – Opportunity",
  companyName: "Acme Corp",
  status: "proposal_prepared",
  value: 16170,
  createdAt: "2026-03-19T00:00:00.000Z",
  updatedAt: "2026-03-19T00:00:00.000Z",
};

export const sampleProjectRecord: ProjectRecord = {
  id: "proj_sample_ghi012_1",
  name: "Acme Corp – Project",
  companyName: "Acme Corp",
  status: "intake",
  owner: "system",
  targetMilestone: "Discovery Phase",
  createdAt: "2026-03-20T14:30:01.000Z",
  updatedAt: "2026-03-20T14:30:01.000Z",
};
