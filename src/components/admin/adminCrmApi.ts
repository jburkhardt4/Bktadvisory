import { supabase } from '../../supabase/client';
import type { Database, Json } from '../../types/supabase';

export type ProfileRecord = Database['public']['Tables']['profiles']['Row'];
export type QuoteRecord = Database['public']['Tables']['quotes']['Row'];
export type ProjectRecord = Database['public']['Tables']['projects']['Row'];
export type ActivityRecord = Database['public']['Tables']['activity_events']['Row'];
export type MilestoneRecord = Database['public']['Tables']['milestones']['Row'];

export type QuoteStatus = Database['public']['Enums']['quote_status'];
export type ProjectStatus = Database['public']['Enums']['project_status'];
export type ActivityEventType = Database['public']['Enums']['activity_event_type'];

export interface QuoteFormData {
  client_name?: string;
  company_name?: string;
  description?: string;
  client_email?: string;
}

export interface AdminQuoteRecord extends QuoteRecord {
  client: ProfileRecord | null;
  metadata: QuoteFormData;
}

export interface AdminProjectRecord extends ProjectRecord {
  client: ProfileRecord | null;
  milestoneCount: number;
  completedMilestoneCount: number;
  activityCount: number;
}

export interface AdminActivityRecord extends ActivityRecord {
  project: ProjectRecord | null;
  client: ProfileRecord | null;
}

export interface AdminMilestoneRecord extends MilestoneRecord {
  project: ProjectRecord | null;
  client: ProfileRecord | null;
}

export interface AdminCrmSnapshot {
  profiles: ProfileRecord[];
  quotes: AdminQuoteRecord[];
  projects: AdminProjectRecord[];
  activities: AdminActivityRecord[];
  milestones: AdminMilestoneRecord[];
}

export interface QuoteMutationValues {
  clientId: string;
  status: QuoteStatus;
  estimatedBudgetMin: string;
  estimatedBudgetMax: string;
  clientName: string;
  companyName: string;
  description: string;
}

export interface ProjectMutationValues {
  clientId: string;
  name: string;
  companyName: string;
  description: string;
  owner: string;
  status: ProjectStatus;
  targetMilestone: string;
}

export interface ActivityMutationValues {
  projectId: string;
  type: ActivityEventType;
  description: string;
  actor: string;
}

export interface MilestoneMutationValues {
  projectId: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
}

export const QUOTE_STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scoping', label: 'Scoping' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'sent', label: 'Sent' },
  { value: 'revision_requested', label: 'Revision Requested' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
];

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'intake', label: 'Intake' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'scoping', label: 'Scoping' },
  { value: 'design_in_progress', label: 'Design in Progress' },
  { value: 'build_in_progress', label: 'Build in Progress' },
  { value: 'awaiting_client', label: 'Awaiting Client' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'uat', label: 'UAT' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export const ACTIVITY_TYPE_OPTIONS: { value: ActivityEventType; label: string }[] = [
  { value: 'quote_generated', label: 'Quote Generated' },
  { value: 'quote_sent', label: 'Quote Sent' },
  { value: 'quote_revised', label: 'Quote Revised' },
  { value: 'quote_accepted', label: 'Quote Accepted' },
  { value: 'project_created', label: 'Project Created' },
  { value: 'discovery_completed', label: 'Discovery Completed' },
  { value: 'scope_approved', label: 'Scope Approved' },
  { value: 'design_started', label: 'Design Started' },
  { value: 'build_started', label: 'Build Started' },
  { value: 'client_feedback_requested', label: 'Client Feedback Requested' },
  { value: 'client_feedback_received', label: 'Client Feedback Received' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'unblocked', label: 'Unblocked' },
  { value: 'uat_started', label: 'UAT Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function assertNoError(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new Error(result.error.message);
  }
}

export function parseQuoteFormData(value: Json | null): QuoteFormData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    client_name: typeof record.client_name === 'string' ? record.client_name : undefined,
    company_name: typeof record.company_name === 'string' ? record.company_name : undefined,
    description: typeof record.description === 'string' ? record.description : undefined,
    client_email: typeof record.client_email === 'string' ? record.client_email : undefined,
  };
}

export function getProfileDisplayName(profile: ProfileRecord | null | undefined): string {
  if (!profile) return 'Unassigned';

  const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim();
  return fullName || profile.email;
}

export function getProfileSummary(profile: ProfileRecord | null | undefined): string {
  if (!profile) return 'Unassigned';

  const displayName = getProfileDisplayName(profile);
  return profile.company_name ? `${displayName} · ${profile.company_name}` : displayName;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatActivityType(type: ActivityEventType): string {
  return type
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function parseCurrencyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildQuotePayload(
  values: QuoteMutationValues,
  client: ProfileRecord | null,
): Database['public']['Tables']['quotes']['Insert'] {
  return {
    client_id: values.clientId || null,
    status: values.status,
    estimated_budget_min: parseCurrencyInput(values.estimatedBudgetMin),
    estimated_budget_max: parseCurrencyInput(values.estimatedBudgetMax),
    form_data: {
      client_name: values.clientName.trim(),
      company_name: values.companyName.trim(),
      description: values.description.trim() || undefined,
      client_email: client?.email ?? undefined,
    },
  };
}

function buildProjectPayload(
  values: ProjectMutationValues,
): Database['public']['Tables']['projects']['Insert'] {
  return {
    client_id: values.clientId || null,
    name: values.name.trim(),
    company_name: values.companyName.trim(),
    description: values.description.trim() || null,
    owner: values.owner.trim(),
    status: values.status,
    target_milestone: values.targetMilestone.trim() || 'TBD',
  };
}

function buildActivityPayload(
  values: ActivityMutationValues,
  project: ProjectRecord | null,
): Database['public']['Tables']['activity_events']['Insert'] {
  return {
    record_id: values.projectId,
    type: values.type,
    description: values.description.trim(),
    actor: values.actor.trim() || null,
    client_id: project?.client_id ?? null,
  };
}

function buildMilestonePayload(
  values: MilestoneMutationValues,
): Database['public']['Tables']['milestones']['Insert'] {
  return {
    project_id: values.projectId,
    title: values.title.trim(),
    description: values.description.trim(),
    target_date: values.targetDate,
    completed: values.completed,
  };
}

export async function fetchAdminCrmSnapshot(): Promise<AdminCrmSnapshot> {
  const [profilesResult, quotesResult, projectsResult, activitiesResult, milestonesResult] =
    await Promise.all([
      supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
      supabase.from('quotes').select('*').order('updated_at', { ascending: false }),
      supabase.from('projects').select('*').order('updated_at', { ascending: false }),
      supabase.from('activity_events').select('*').order('created_at', { ascending: false }),
      supabase.from('milestones').select('*').order('target_date', { ascending: true }),
    ]);

  assertNoError(profilesResult);
  assertNoError(quotesResult);
  assertNoError(projectsResult);
  assertNoError(activitiesResult);
  assertNoError(milestonesResult);

  const profiles = (profilesResult.data ?? []) as ProfileRecord[];
  const quotes = (quotesResult.data ?? []) as QuoteRecord[];
  const projects = (projectsResult.data ?? []) as ProjectRecord[];
  const activities = (activitiesResult.data ?? []) as ActivityRecord[];
  const milestones = (milestonesResult.data ?? []) as MilestoneRecord[];

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  const milestoneCountByProject = new Map<string, number>();
  const completedMilestoneCountByProject = new Map<string, number>();
  const activityCountByProject = new Map<string, number>();

  milestones.forEach((milestone) => {
    milestoneCountByProject.set(
      milestone.project_id,
      (milestoneCountByProject.get(milestone.project_id) ?? 0) + 1,
    );

    if (milestone.completed) {
      completedMilestoneCountByProject.set(
        milestone.project_id,
        (completedMilestoneCountByProject.get(milestone.project_id) ?? 0) + 1,
      );
    }
  });

  activities.forEach((activity) => {
    activityCountByProject.set(
      activity.record_id,
      (activityCountByProject.get(activity.record_id) ?? 0) + 1,
    );
  });

  return {
    profiles,
    quotes: quotes.map((quote) => ({
      ...quote,
      client: quote.client_id ? profileMap.get(quote.client_id) ?? null : null,
      metadata: parseQuoteFormData(quote.form_data),
    })),
    projects: projects.map((project) => ({
      ...project,
      client: project.client_id ? profileMap.get(project.client_id) ?? null : null,
      milestoneCount: milestoneCountByProject.get(project.id) ?? 0,
      completedMilestoneCount: completedMilestoneCountByProject.get(project.id) ?? 0,
      activityCount: activityCountByProject.get(project.id) ?? 0,
    })),
    activities: activities.map((activity) => {
      const project = projectMap.get(activity.record_id) ?? null;

      return {
        ...activity,
        project,
        client:
          (activity.client_id ? profileMap.get(activity.client_id) : null) ??
          (project?.client_id ? profileMap.get(project.client_id) ?? null : null),
      };
    }),
    milestones: milestones.map((milestone) => {
      const project = projectMap.get(milestone.project_id) ?? null;

      return {
        ...milestone,
        project,
        client: project?.client_id ? profileMap.get(project.client_id) ?? null : null,
      };
    }),
  };
}

export async function createAdminQuote(
  values: QuoteMutationValues,
  client: ProfileRecord | null,
) {
  const result = await supabase.from('quotes').insert(buildQuotePayload(values, client));
  assertNoError(result);
}

export async function updateAdminQuote(
  quoteId: string,
  values: QuoteMutationValues,
  client: ProfileRecord | null,
) {
  const result = await supabase
    .from('quotes')
    .update(buildQuotePayload(values, client))
    .eq('id', quoteId);
  assertNoError(result);
}

export async function deleteAdminQuote(quoteId: string) {
  const result = await supabase.from('quotes').delete().eq('id', quoteId);
  assertNoError(result);
}

export async function createAdminProject(
  values: ProjectMutationValues,
) {
  const result = await supabase.from('projects').insert(buildProjectPayload(values));
  assertNoError(result);
}

export async function updateAdminProject(
  projectId: string,
  values: ProjectMutationValues,
  client: ProfileRecord | null,
) {
  const projectResult = await supabase
    .from('projects')
    .update(buildProjectPayload(values))
    .eq('id', projectId);
  assertNoError(projectResult);

  const activityResult = await supabase
    .from('activity_events')
    .update({ client_id: client?.id ?? null })
    .eq('record_id', projectId);
  assertNoError(activityResult);
}

export async function deleteAdminProject(projectId: string) {
  const milestoneResult = await supabase.from('milestones').delete().eq('project_id', projectId);
  assertNoError(milestoneResult);

  const activityResult = await supabase.from('activity_events').delete().eq('record_id', projectId);
  assertNoError(activityResult);

  const projectResult = await supabase.from('projects').delete().eq('id', projectId);
  assertNoError(projectResult);
}

export async function createAdminActivity(
  values: ActivityMutationValues,
  project: ProjectRecord | null,
) {
  const result = await supabase.from('activity_events').insert(buildActivityPayload(values, project));
  assertNoError(result);
}

export async function updateAdminActivity(
  activityId: string,
  values: ActivityMutationValues,
  project: ProjectRecord | null,
) {
  const result = await supabase
    .from('activity_events')
    .update(buildActivityPayload(values, project))
    .eq('id', activityId);
  assertNoError(result);
}

export async function deleteAdminActivity(activityId: string) {
  const result = await supabase.from('activity_events').delete().eq('id', activityId);
  assertNoError(result);
}

export async function createAdminMilestone(values: MilestoneMutationValues) {
  const result = await supabase.from('milestones').insert(buildMilestonePayload(values));
  assertNoError(result);
}

export async function updateAdminMilestone(
  milestoneId: string,
  values: MilestoneMutationValues,
  currentMilestone: AdminMilestoneRecord | null,
) {
  const result = await supabase
    .from('milestones')
    .update(buildMilestonePayload(values))
    .eq('id', milestoneId);
  assertNoError(result);

  if (
    currentMilestone?.project &&
    currentMilestone.project.target_milestone === currentMilestone.title &&
    currentMilestone.title !== values.title.trim()
  ) {
    const projectResult = await supabase
      .from('projects')
      .update({ target_milestone: values.title.trim() })
      .eq('id', currentMilestone.project_id);
    assertNoError(projectResult);
  }
}

export async function deleteAdminMilestone(milestone: AdminMilestoneRecord) {
  if (milestone.project && milestone.project.target_milestone === milestone.title) {
    const projectResult = await supabase
      .from('projects')
      .update({ target_milestone: 'TBD' })
      .eq('id', milestone.project_id);
    assertNoError(projectResult);
  }

  const result = await supabase.from('milestones').delete().eq('id', milestone.id);
  assertNoError(result);
}
