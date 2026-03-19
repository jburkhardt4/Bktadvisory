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
  status: "draft",
  createdAt: "2026-03-19T00:00:00.000Z",
  updatedAt: "2026-03-19T00:00:00.000Z",

  contact: {
    firstName: "Jane",
    lastName: "Doe",
    companyName: "Acme Corp",
    email: "jane.doe@acme.com",
    phone: "+1-555-0100",
    website: "https://acme.com",
  },

  project: {
    type: "custom",
    description:
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
  },

  pricing: {
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
  },

  valueStatement:
    "By consolidating your CRM and communication tools, your team can respond to leads 50% faster while reducing manual overhead.",

  activity: [
    {
      id: "evt_sample_xyz789_1",
      milestone: "quote_generated",
      timestamp: "2026-03-19T00:00:00.000Z",
      actor: "jane.doe@acme.com",
    },
  ],
};

export const sampleActivityEvents: ActivityEvent[] = [
  {
    id: "evt_sample_001",
    milestone: "quote_generated",
    timestamp: "2026-03-19T00:00:00.000Z",
    actor: "jane.doe@acme.com",
  },
  {
    id: "evt_sample_002",
    milestone: "quote_sent",
    timestamp: "2026-03-19T01:00:00.000Z",
    actor: "sales@bktadvisory.com",
    metadata: { recipientEmail: "jane.doe@acme.com" },
  },
  {
    id: "evt_sample_003",
    milestone: "quote_accepted",
    timestamp: "2026-03-20T14:30:00.000Z",
    actor: "jane.doe@acme.com",
  },
  {
    id: "evt_sample_004",
    milestone: "project_created",
    timestamp: "2026-03-20T14:30:01.000Z",
    actor: "system",
  },
];

export const sampleOpportunityRecord: OpportunityRecord = {
  id: "opp_sample_def456_1",
  quoteId: "quote_sample_abc123_1",
  stage: "proposal",
  createdAt: "2026-03-19T00:00:00.000Z",
  updatedAt: "2026-03-19T00:00:00.000Z",
  companyName: "Acme Corp",
  contactEmail: "jane.doe@acme.com",
  estimatedValue: 16170,
  description:
    "Salesforce CRM implementation with Slack integration and AI-powered analytics.",
};

export const sampleProjectRecord: ProjectRecord = {
  id: "proj_sample_ghi012_1",
  quoteId: "quote_sample_abc123_1",
  opportunityId: "opp_sample_def456_1",
  status: "planning",
  createdAt: "2026-03-20T14:30:01.000Z",
  updatedAt: "2026-03-20T14:30:01.000Z",

  name: "Acme Corp – custom",
  companyName: "Acme Corp",
  contactEmail: "jane.doe@acme.com",
  description:
    "Salesforce CRM implementation with Slack integration and AI-powered analytics.",

  estimatedHours: 210,
  estimatedWeeks: 6,
  totalBudget: 16170,
  hourlyRate: 77,

  deliveryTeam: "nearshore",
  powerUps: ["Project Manager", "Solutions Architect"],

  activity: [
    {
      id: "evt_sample_004",
      milestone: "project_created",
      timestamp: "2026-03-20T14:30:01.000Z",
      actor: "system",
    },
  ],
};
