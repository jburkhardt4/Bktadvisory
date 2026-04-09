import { supabase } from '../../supabase/client';
import type { Database } from '../../types/supabase';

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------
export type AccountRecord = Database['public']['Tables']['accounts']['Row'];
export type ContactRecord = Database['public']['Tables']['contacts']['Row'];
export type DealRecord = Database['public']['Tables']['deals']['Row'];
export type PipelineRecord = Database['public']['Tables']['pipelines']['Row'];

export type ContactSource = Database['public']['Enums']['contact_source'];
export type DealStage = Database['public']['Enums']['deal_stage'];

// ---------------------------------------------------------------------------
// Enriched records (with resolved relations)
// ---------------------------------------------------------------------------
export interface SalesContactRecord extends ContactRecord {
  account: AccountRecord | null;
  dealCount: number;
}

export interface SalesDealRecord extends DealRecord {
  contact: ContactRecord | null;
  account: AccountRecord | null;
}

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------
export interface SalesCrmSnapshot {
  accounts: AccountRecord[];
  contacts: SalesContactRecord[];
  deals: SalesDealRecord[];
  pipelines: PipelineRecord[];
}

// ---------------------------------------------------------------------------
// Mutation value types
// ---------------------------------------------------------------------------
export interface AccountMutationValues {
  name: string;
  domain: string;
  industry: string;
  employeeCount: string;
  annualRevenue: string;
  notes: string;
}

export interface ContactMutationValues {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  linkedinUrl: string;
  upworkUrl: string;
  source: ContactSource;
  notes: string;
}

export interface DealMutationValues {
  pipelineId: string;
  contactId: string;
  accountId: string;
  quoteId: string;
  name: string;
  stage: DealStage;
  value: string;
  probability: string;
  expectedClose: string;
  owner: string;
}

// ---------------------------------------------------------------------------
// Option arrays
// ---------------------------------------------------------------------------
export const CONTACT_SOURCE_OPTIONS: { value: ContactSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'email', label: 'Gmail' },
  { value: 'manual', label: 'Other' },
  { value: 'referral', label: 'Referral' },
  { value: 'estimator', label: 'Estimator' },
];

export const DEAL_STAGE_OPTIONS: { value: DealStage; label: string }[] = [
  { value: 'identified', label: 'Identified' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function assertNoError(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new Error(result.error.message);
  }
}

function parseCurrencyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getContactDisplayName(contact: ContactRecord | null | undefined): string {
  if (!contact) return 'No contact';
  const full = `${contact.first_name} ${contact.last_name}`.trim();
  return full || contact.email || 'Unnamed contact';
}

export function formatDealStage(stage: DealStage): string {
  return DEAL_STAGE_OPTIONS.find((o) => o.value === stage)?.label ?? stage;
}

export function formatContactSource(source: ContactSource): string {
  return CONTACT_SOURCE_OPTIONS.find((o) => o.value === source)?.label ?? source;
}

// ---------------------------------------------------------------------------
// Payload builders
// ---------------------------------------------------------------------------
function buildAccountPayload(
  values: AccountMutationValues,
): Database['public']['Tables']['accounts']['Insert'] {
  return {
    name: values.name.trim(),
    domain: values.domain.trim() || null,
    industry: values.industry.trim() || null,
    employee_count: parseIntInput(values.employeeCount),
    annual_revenue: parseCurrencyInput(values.annualRevenue),
    notes: values.notes.trim() || null,
  };
}

function buildContactPayload(
  values: ContactMutationValues,
): Database['public']['Tables']['contacts']['Insert'] {
  return {
    account_id: values.accountId || null,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    website_url: values.websiteUrl.trim() || null,
    linkedin_url: values.linkedinUrl.trim() || null,
    upwork_url: values.upworkUrl.trim() || null,
    source: values.source,
    notes: values.notes.trim() || null,
  };
}

function buildDealPayload(
  values: DealMutationValues,
): Database['public']['Tables']['deals']['Insert'] {
  return {
    pipeline_id: values.pipelineId,
    contact_id: values.contactId || null,
    account_id: values.accountId || null,
    quote_id: values.quoteId || null,
    name: values.name.trim(),
    stage: values.stage,
    value: parseCurrencyInput(values.value) ?? 0,
    probability: parseIntInput(values.probability) ?? 0,
    expected_close: values.expectedClose || null,
    owner: values.owner.trim() || null,
  };
}

// ---------------------------------------------------------------------------
// Fetch snapshot
// ---------------------------------------------------------------------------
export async function fetchSalesCrmSnapshot(): Promise<SalesCrmSnapshot> {
  const [accountsResult, contactsResult, dealsResult, pipelinesResult] =
    await Promise.all([
      supabase.from('accounts').select('*').order('updated_at', { ascending: false }),
      supabase.from('contacts').select('*').order('updated_at', { ascending: false }),
      supabase.from('deals').select('*').order('updated_at', { ascending: false }),
      supabase.from('pipelines').select('*').order('created_at', { ascending: false }),
    ]);

  assertNoError(accountsResult);
  assertNoError(contactsResult);
  assertNoError(dealsResult);
  assertNoError(pipelinesResult);

  const accounts = (accountsResult.data ?? []) as AccountRecord[];
  const contacts = (contactsResult.data ?? []) as ContactRecord[];
  const deals = (dealsResult.data ?? []) as DealRecord[];
  const pipelines = (pipelinesResult.data ?? []) as PipelineRecord[];

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const dealCountByContact = new Map<string, number>();
  deals.forEach((deal) => {
    if (deal.contact_id) {
      dealCountByContact.set(
        deal.contact_id,
        (dealCountByContact.get(deal.contact_id) ?? 0) + 1,
      );
    }
  });

  return {
    accounts,
    contacts: contacts.map((contact) => ({
      ...contact,
      account: contact.account_id ? accountMap.get(contact.account_id) ?? null : null,
      dealCount: dealCountByContact.get(contact.id) ?? 0,
    })),
    deals: deals.map((deal) => ({
      ...deal,
      contact: deal.contact_id ? contactMap.get(deal.contact_id) ?? null : null,
      account: deal.account_id ? accountMap.get(deal.account_id) ?? null : null,
    })),
    pipelines,
  };
}

// ---------------------------------------------------------------------------
// Account CRUD
// ---------------------------------------------------------------------------
export async function createAccount(values: AccountMutationValues) {
  const result = await supabase.from('accounts').insert(buildAccountPayload(values));
  assertNoError(result);
}

export async function updateAccount(id: string, values: AccountMutationValues) {
  const result = await supabase.from('accounts').update(buildAccountPayload(values)).eq('id', id);
  assertNoError(result);
}

export async function deleteAccount(id: string) {
  const result = await supabase.from('accounts').delete().eq('id', id);
  assertNoError(result);
}

// ---------------------------------------------------------------------------
// Contact CRUD
// ---------------------------------------------------------------------------
export async function createContact(values: ContactMutationValues) {
  const result = await supabase.from('contacts').insert(buildContactPayload(values));
  assertNoError(result);
}

export async function updateContact(id: string, values: ContactMutationValues) {
  const result = await supabase.from('contacts').update(buildContactPayload(values)).eq('id', id);
  assertNoError(result);
}

export async function deleteContact(id: string) {
  const result = await supabase.from('contacts').delete().eq('id', id);
  assertNoError(result);
}

// ---------------------------------------------------------------------------
// Deal CRUD
// ---------------------------------------------------------------------------
export async function createDeal(values: DealMutationValues) {
  const result = await supabase.from('deals').insert(buildDealPayload(values));
  assertNoError(result);
}

export async function updateDeal(id: string, values: DealMutationValues) {
  const result = await supabase.from('deals').update(buildDealPayload(values)).eq('id', id);
  assertNoError(result);
}

export async function deleteDeal(id: string) {
  const result = await supabase.from('deals').delete().eq('id', id);
  assertNoError(result);
}

// ---------------------------------------------------------------------------
// Deal stage update (for kanban drag)
// ---------------------------------------------------------------------------
export async function updateDealStage(id: string, stage: DealStage) {
  const result = await supabase.from('deals').update({ stage }).eq('id', id);
  assertNoError(result);
}

// ---------------------------------------------------------------------------
// Estimator → Lead creation
// ---------------------------------------------------------------------------
export interface EstimatorLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  websiteUrl: string;
}

export async function createLeadFromEstimator(input: EstimatorLeadInput) {
  const result = await supabase.from('contacts').insert({
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    website_url: input.websiteUrl.trim() || null,
    source: 'website' as ContactSource,
    tags: ['estimator-quote'],
  });
  assertNoError(result);
}
