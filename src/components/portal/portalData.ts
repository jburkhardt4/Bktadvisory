// Mock data for the Client Portal

export type QuoteStatus = 'draft' | 'scoping' | 'quoted' | 'sent' | 'revision_requested' | 'accepted' | 'declined' | 'expired';
export type ProjectStatus = 'intake' | 'discovery' | 'scoping' | 'design_in_progress' | 'build_in_progress' | 'awaiting_client' | 'blocked' | 'uat' | 'completed' | 'archived';
export type OpportunityStatus = 'discovery' | 'solutioning' | 'proposal_prepared' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Quote {
  id: string;
  title: string;
  status: QuoteStatus;
  amount: number;
  createdAt: string;
  updatedAt: string;
  reference: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate: string;
  estimatedEnd: string;
  progress: number;
  quoteRef: string;
  description: string;
  milestones: Milestone[];
  owner?: string;
  company?: string;
  targetMilestone?: string;
  clientActions?: ClientAction[];
  projectActivity?: ProjectActivityEvent[];
  blockers?: Blocker[];
  documents?: ProjectDocument[];
}

export interface ClientAction {
  id: string;
  type: 'awaiting_approval' | 'awaiting_content' | 'awaiting_credentials';
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Blocker {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning';
  createdAt: string;
  owner: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'figma' | 'link';
  size?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type ProjectActivityType =
  | 'quote_generated' | 'quote_sent' | 'quote_accepted'
  | 'project_created' | 'discovery_completed' | 'scope_approved'
  | 'design_started' | 'build_started' | 'blocked' | 'unblocked'
  | 'uat_started' | 'completed' | 'comment' | 'document_uploaded';

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  description: string;
}

export interface ProjectActivityEvent {
  id: string;
  type: ProjectActivityType;
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface ActivityEvent {
  id: string;
  type: 'quote' | 'project' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: QuoteStatus | ProjectStatus;
}

export const QUOTE_STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' },
  scoping: { label: 'Scoping', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  quoted: { label: 'Quoted', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  sent: { label: 'Sent', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400' },
  revision_requested: { label: 'Revision Requested', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
  accepted: { label: 'Accepted', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  declined: { label: 'Declined', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
  expired: { label: 'Expired', color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-500/20', dot: 'bg-gray-500' },
};

export const OPPORTUNITY_STATUS_CONFIG: Record<OpportunityStatus, { label: string; color: string; bg: string; dot: string }> = {
  discovery: { label: 'Discovery', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  solutioning: { label: 'Solutioning', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', dot: 'bg-cyan-400' },
  proposal_prepared: { label: 'Proposal Prepared', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  proposal_sent: { label: 'Proposal Sent', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  negotiation: { label: 'Negotiation', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400' },
  closed_won: { label: 'Closed Won', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  closed_lost: { label: 'Closed Lost', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
};

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  intake: { label: 'Intake', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-400' },
  discovery: { label: 'Discovery', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  scoping: { label: 'Scoping', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  design_in_progress: { label: 'Design in Progress', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', dot: 'bg-cyan-400' },
  build_in_progress: { label: 'Build in Progress', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  awaiting_client: { label: 'Awaiting Client', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400' },
  blocked: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
  uat: { label: 'UAT', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  archived: { label: 'Archived', color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-500/20', dot: 'bg-gray-500' },
};

export const mockUser = {
  name: 'Sarah Mitchell',
  company: 'Apex Financial Group',
  email: 'sarah.mitchell@apexfinancial.com',
  phone: '+1 (415) 555-0192',
  role: 'VP of Technology',
  accountStatus: 'Active' as const,
  memberSince: 'Jan 2024',
  avatar: null,
};

export const mockQuotes: Quote[] = [
  { id: 'Q-2024-001', title: 'Salesforce CPQ Implementation', status: 'accepted', amount: 145000, createdAt: '2024-01-15', updatedAt: '2024-02-01', reference: 'Q-2024-001' },
  { id: 'Q-2024-002', title: 'Service Cloud Migration', status: 'sent', amount: 89500, createdAt: '2024-02-20', updatedAt: '2024-03-01', reference: 'Q-2024-002' },
  { id: 'Q-2024-003', title: 'Marketing Cloud Integration', status: 'revision_requested', amount: 67200, createdAt: '2024-03-05', updatedAt: '2024-03-12', reference: 'Q-2024-003' },
  { id: 'Q-2024-004', title: 'Data Cloud Analytics Setup', status: 'draft', amount: 52800, createdAt: '2024-03-15', updatedAt: '2024-03-15', reference: 'Q-2024-004' },
  { id: 'Q-2024-005', title: 'Einstein AI Enablement', status: 'quoted', amount: 118000, createdAt: '2024-03-10', updatedAt: '2024-03-14', reference: 'Q-2024-005' },
];

export const mockProjects: Project[] = [
  {
    id: 'P-2024-001', name: 'Salesforce CPQ Implementation', status: 'build_in_progress',
    startDate: '2024-02-15', estimatedEnd: '2024-06-30', progress: 62, quoteRef: 'Q-2024-001',
    description: 'Full CPQ implementation with custom pricing rules, guided selling, and approval workflows for the enterprise sales team.',
    owner: 'Marcus Chen',
    company: 'Apex Financial Group',
    targetMilestone: 'Core Build - Phase 2',
    milestones: [
      { id: 'm1', title: 'Discovery & Requirements', date: '2024-02-28', completed: true, description: 'Stakeholder interviews and requirements gathering' },
      { id: 'm2', title: 'Solution Design', date: '2024-03-15', completed: true, description: 'Architecture design and approval' },
      { id: 'm3', title: 'Core Build - Phase 1', date: '2024-04-15', completed: true, description: 'Product catalog, pricing rules, bundle configuration' },
      { id: 'm4', title: 'Core Build - Phase 2', date: '2024-05-15', completed: false, description: 'Approval workflows, guided selling, document generation' },
      { id: 'm5', title: 'UAT & Training', date: '2024-06-15', completed: false, description: 'User acceptance testing and team training sessions' },
      { id: 'm6', title: 'Go-Live', date: '2024-06-30', completed: false, description: 'Production deployment and hypercare' },
    ],
    clientActions: [
      { id: 'ca1', type: 'awaiting_approval', title: 'Approve Discount Matrix Logic', description: 'Review and approve the tiered discount matrix for enterprise accounts before build continues.', dueDate: '2024-03-25', priority: 'high' },
      { id: 'ca2', type: 'awaiting_content', title: 'Provide Product Descriptions', description: 'Submit final marketing-approved product descriptions for 12 bundle SKUs.', dueDate: '2024-03-28', priority: 'medium' },
      { id: 'ca3', type: 'awaiting_credentials', title: 'ERP Sandbox Access', description: 'Provide staging credentials for the NetSuite sandbox environment for integration testing.', priority: 'high' },
    ],
    blockers: [
      { id: 'b1', title: 'Discount Matrix Pending Client Approval', description: 'Cannot proceed with approval workflow build until the tiered discount matrix is signed off by finance.', severity: 'critical', createdAt: '2024-03-18', owner: 'Sarah Mitchell' },
    ],
    projectActivity: [
      { id: 'pa1', type: 'build_started', title: 'Phase 2 Build Commenced', description: 'Approval workflows and guided selling configuration underway.', timestamp: '2024-03-18T14:30:00Z', user: 'Marcus Chen' },
      { id: 'pa2', type: 'blocked', title: 'Blocked on Discount Matrix', description: 'Awaiting client approval on tiered discount logic before approval workflow can be finalized.', timestamp: '2024-03-18T10:00:00Z', user: 'Marcus Chen' },
      { id: 'pa3', type: 'scope_approved', title: 'Phase 2 Scope Approved', description: 'Client signed off on Phase 2 deliverables and timeline.', timestamp: '2024-03-14T16:00:00Z', user: 'Sarah Mitchell' },
      { id: 'pa4', type: 'document_uploaded', title: 'Solution Design Document v2.1', description: 'Updated solution design reflecting Phase 1 learnings uploaded.', timestamp: '2024-03-12T11:00:00Z', user: 'Marcus Chen' },
      { id: 'pa5', type: 'comment', title: 'Weekly Status Update', description: 'Phase 1 completed on schedule. All pricing rules tested and validated in staging.', timestamp: '2024-03-10T09:00:00Z', user: 'Marcus Chen' },
      { id: 'pa6', type: 'discovery_completed', title: 'Discovery Phase Complete', description: 'All stakeholder interviews completed. 47 requirements documented and prioritized.', timestamp: '2024-02-28T17:00:00Z', user: 'Marcus Chen' },
      { id: 'pa7', type: 'quote_accepted', title: 'Quote Accepted', description: 'Engagement quote Q-2024-001 accepted — $145,000.', timestamp: '2024-02-01T10:00:00Z', user: 'Sarah Mitchell' },
      { id: 'pa8', type: 'project_created', title: 'Project Created', description: 'Salesforce CPQ Implementation project initiated in the BKT Advisory portal.', timestamp: '2024-01-20T09:00:00Z', user: 'System' },
    ],
    documents: [
      { id: 'd1', name: 'Solution Design Document v2.1.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2024-03-12', uploadedBy: 'Marcus Chen' },
      { id: 'd2', name: 'CPQ Requirements Matrix.xlsx', type: 'xlsx', size: '890 KB', uploadedAt: '2024-02-28', uploadedBy: 'Marcus Chen' },
      { id: 'd3', name: 'Stakeholder Interview Notes.docx', type: 'docx', size: '1.1 MB', uploadedAt: '2024-02-25', uploadedBy: 'Marcus Chen' },
      { id: 'd4', name: 'Pricing Rules Specification.pdf', type: 'pdf', size: '1.8 MB', uploadedAt: '2024-03-05', uploadedBy: 'Priya Sharma' },
      { id: 'd5', name: 'Architecture Diagram', type: 'figma', uploadedAt: '2024-03-10', uploadedBy: 'Marcus Chen' },
      { id: 'd6', name: 'Project Charter & SOW.pdf', type: 'pdf', size: '540 KB', uploadedAt: '2024-02-15', uploadedBy: 'Marcus Chen' },
    ],
  },
  {
    id: 'P-2024-002', name: 'CRM Health Check', status: 'awaiting_client',
    startDate: '2024-03-01', estimatedEnd: '2024-04-15', progress: 45, quoteRef: 'Q-2024-002',
    description: 'Comprehensive audit of existing Salesforce org with optimization recommendations.',
    owner: 'Priya Sharma',
    company: 'Apex Financial Group',
    targetMilestone: 'Client Sign-off on Findings',
    clientActions: [
      { id: 'ca4', type: 'awaiting_approval', title: 'Review Audit Findings Report', description: 'Review the 48-page CRM health audit and approve remediation priorities.', dueDate: '2024-04-05', priority: 'high' },
    ],
    milestones: [
      { id: 'm1', title: 'Data Quality Audit', date: '2024-03-10', completed: true, description: 'Analyze data quality and duplication' },
      { id: 'm2', title: 'Security Review', date: '2024-03-20', completed: true, description: 'Permission sets, profiles, and sharing rules audit' },
      { id: 'm3', title: 'Client Sign-off on Findings', date: '2024-04-01', completed: false, description: 'Awaiting client review of audit findings report' },
    ],
  },
  {
    id: 'P-2024-003', name: 'Integration Hub Setup', status: 'blocked',
    startDate: '2024-02-20', estimatedEnd: '2024-05-30', progress: 30, quoteRef: 'Q-2024-003',
    description: 'MuleSoft integration hub connecting Salesforce with ERP, billing, and inventory systems.',
    owner: 'Marcus Chen',
    company: 'Apex Financial Group',
    targetMilestone: 'ERP Connector Build',
    blockers: [
      { id: 'b2', title: 'ERP Vendor API Credentials Missing', description: 'Cannot proceed with ERP connector build — awaiting API credentials from NetSuite vendor contact.', severity: 'critical', createdAt: '2024-03-10', owner: 'Sarah Mitchell' },
    ],
    clientActions: [
      { id: 'ca5', type: 'awaiting_credentials', title: 'NetSuite API Credentials', description: 'Coordinate with NetSuite vendor to provide sandbox and production API keys.', priority: 'high' },
    ],
    milestones: [
      { id: 'm1', title: 'API Design', date: '2024-03-05', completed: true, description: 'API specifications and data mapping' },
      { id: 'm2', title: 'ERP Connector Build', date: '2024-04-01', completed: false, description: 'Blocked: Awaiting ERP vendor API credentials' },
    ],
  },
  {
    id: 'P-2024-004', name: 'Revenue Cloud Rollout', status: 'completed',
    startDate: '2023-09-01', estimatedEnd: '2024-01-15', progress: 100, quoteRef: 'Q-2023-008',
    description: 'End-to-end Revenue Cloud implementation including billing, invoicing, and revenue recognition.',
    owner: 'Priya Sharma',
    company: 'Apex Financial Group',
    targetMilestone: 'Go-Live',
    milestones: [
      { id: 'm1', title: 'Discovery', date: '2023-09-15', completed: true, description: 'Requirements and process mapping' },
      { id: 'm2', title: 'Build', date: '2023-11-30', completed: true, description: 'Configuration and customization' },
      { id: 'm3', title: 'UAT', date: '2023-12-20', completed: true, description: 'User acceptance testing' },
      { id: 'm4', title: 'Go-Live', date: '2024-01-10', completed: true, description: 'Production deployment' },
    ],
  },
];

export const mockActivity: ActivityEvent[] = [
  { id: 'a1', type: 'project', title: 'Build Phase 2 Started', description: 'CPQ Implementation moved to Core Build - Phase 2', timestamp: '2024-03-18T14:30:00Z', status: 'build_in_progress' },
  { id: 'a2', type: 'quote', title: 'Revision Requested', description: 'Marketing Cloud Integration quote — client requested scope adjustment', timestamp: '2024-03-12T10:15:00Z', status: 'revision_requested' },
  { id: 'a3', type: 'project', title: 'Blocked: Awaiting Credentials', description: 'Integration Hub Setup blocked on ERP vendor API credentials', timestamp: '2024-03-10T09:00:00Z', status: 'blocked' },
  { id: 'a4', type: 'quote', title: 'New Quote Generated', description: 'Einstein AI Enablement quote created — $118,000', timestamp: '2024-03-10T08:00:00Z', status: 'quoted' },
  { id: 'a5', type: 'quote', title: 'Quote Sent', description: 'Service Cloud Migration quote sent for review', timestamp: '2024-03-01T16:45:00Z', status: 'sent' },
  { id: 'a6', type: 'project', title: 'Awaiting Client Input', description: 'CRM Health Check — audit findings report pending client review', timestamp: '2024-03-01T11:00:00Z', status: 'awaiting_client' },
  { id: 'a7', type: 'system', title: 'Account Activated', description: 'BKT Advisory portal account activated for Apex Financial Group', timestamp: '2024-01-15T09:00:00Z' },
];
