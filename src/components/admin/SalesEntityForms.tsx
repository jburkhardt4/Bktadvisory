import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CONTACT_SOURCE_OPTIONS,
  DEAL_STAGE_OPTIONS,
  getContactDisplayName,
  type AccountMutationValues,
  type AccountRecord,
  type ContactMutationValues,
  type ContactRecord,
  type DealMutationValues,
  type PipelineRecord,
  type SalesContactRecord,
  type SalesDealRecord,
} from './salesCrmApi';
import { formatCurrency, formatDateTime, type AdminQuoteRecord } from './adminCrmApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

// ---------------------------------------------------------------------------
// Shared form primitives
// ---------------------------------------------------------------------------
function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}

// =====================================================================
// Account Form
// =====================================================================
type AccountFormErrors = Partial<Record<keyof AccountMutationValues, string>>;

function buildAccountValues(record?: AccountRecord | null): AccountMutationValues {
  return {
    name: record?.name ?? '',
    domain: record?.domain ?? '',
    industry: record?.industry ?? '',
    employeeCount: record?.employee_count != null ? String(record.employee_count) : '',
    annualRevenue: record?.annual_revenue != null ? String(record.annual_revenue) : '',
    notes: record?.notes ?? '',
  };
}

function validateAccountValues(values: AccountMutationValues): AccountFormErrors {
  const errors: AccountFormErrors = {};
  if (!values.name.trim()) errors.name = 'Account name is required.';
  return errors;
}

export function AdminAccountForm({
  initialRecord,
  onCancel,
  onSave,
}: {
  initialRecord?: AccountRecord | null;
  onCancel: () => void;
  onSave: (values: AccountMutationValues) => Promise<void>;
}) {
  const [values, setValues] = useState<AccountMutationValues>(buildAccountValues(initialRecord));
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildAccountValues(initialRecord));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAccountValues(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the account.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Account Name</label>
          <Input
            value={values.name}
            onChange={(e) => { setValues((v) => ({ ...v, name: e.target.value })); setErrors((e2) => ({ ...e2, name: undefined })); }}
            placeholder="e.g. Apex Financial Group"
            disabled={isSaving}
          />
          <FormError message={errors.name} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Domain</label>
          <Input
            value={values.domain}
            onChange={(e) => setValues((v) => ({ ...v, domain: e.target.value }))}
            placeholder="e.g. apexfinancial.com"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Industry</label>
          <Input
            value={values.industry}
            onChange={(e) => setValues((v) => ({ ...v, industry: e.target.value }))}
            placeholder="e.g. Financial Services"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Employees</label>
          <Input
            type="number"
            min="0"
            value={values.employeeCount}
            onChange={(e) => setValues((v) => ({ ...v, employeeCount: e.target.value }))}
            placeholder="e.g. 500"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Annual Revenue (USD)</label>
        <Input
          type="number"
          min="0"
          step="1000"
          value={values.annualRevenue}
          onChange={(e) => setValues((v) => ({ ...v, annualRevenue: e.target.value }))}
          placeholder="e.g. 10000000"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notes</label>
        <Textarea
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          placeholder="Internal notes about this account"
          className="min-h-24"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving} className="bkt-primary-button rounded-xl">
          {isSaving ? 'Saving…' : initialRecord ? 'Save Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}

// =====================================================================
// Contact Form
// =====================================================================
type ContactFormErrors = Partial<Record<keyof ContactMutationValues, string>>;

function buildContactValues(record?: SalesContactRecord | null): ContactMutationValues {
  return {
    accountId: record?.account_id ?? '',
    firstName: record?.first_name ?? '',
    lastName: record?.last_name ?? '',
    email: record?.email ?? '',
    phone: record?.phone ?? '',
    linkedinUrl: record?.linkedin_url ?? '',
    upworkUrl: record?.upwork_url ?? '',
    source: record?.source ?? 'manual',
    notes: record?.notes ?? '',
  };
}

function validateContactValues(values: ContactMutationValues): ContactFormErrors {
  const errors: ContactFormErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  return errors;
}

export function AdminContactForm({
  accounts,
  initialRecord,
  onCancel,
  onSave,
}: {
  accounts: AccountRecord[];
  initialRecord?: SalesContactRecord | null;
  onCancel: () => void;
  onSave: (values: ContactMutationValues) => Promise<void>;
}) {
  const [values, setValues] = useState<ContactMutationValues>(buildContactValues(initialRecord));
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildContactValues(initialRecord));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateContactValues(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the contact.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Account</label>
        <Select
          value={values.accountId || undefined}
          onValueChange={(v) => { setValues((prev) => ({ ...prev, accountId: v })); }}
          disabled={isSaving}
        >
          <SelectTrigger><SelectValue placeholder="Select an account (optional)" /></SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">First Name</label>
          <Input
            value={values.firstName}
            onChange={(e) => { setValues((v) => ({ ...v, firstName: e.target.value })); setErrors((e2) => ({ ...e2, firstName: undefined })); }}
            placeholder="First name"
            disabled={isSaving}
          />
          <FormError message={errors.firstName} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Last Name</label>
          <Input
            value={values.lastName}
            onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
            placeholder="Last name"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            placeholder="contact@example.com"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Phone</label>
          <Input
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">LinkedIn URL</label>
          <Input
            value={values.linkedinUrl}
            onChange={(e) => setValues((v) => ({ ...v, linkedinUrl: e.target.value }))}
            placeholder="linkedin.com/in/..."
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Upwork URL</label>
          <Input
            value={values.upworkUrl}
            onChange={(e) => setValues((v) => ({ ...v, upworkUrl: e.target.value }))}
            placeholder="upwork.com/..."
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Source</label>
        <Select
          value={values.source}
          onValueChange={(v) => setValues((prev) => ({ ...prev, source: v as ContactMutationValues['source'] }))}
          disabled={isSaving}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CONTACT_SOURCE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notes</label>
        <Textarea
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          placeholder="Internal notes about this contact"
          className="min-h-24"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving} className="bkt-primary-button rounded-xl">
          {isSaving ? 'Saving…' : initialRecord ? 'Save Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}

// =====================================================================
// Deal Form
// =====================================================================
type DealFormErrors = Partial<Record<keyof DealMutationValues, string>>;

function buildDealValues(
  record?: SalesDealRecord | null,
  defaultPipelineId?: string,
): DealMutationValues {
  return {
    pipelineId: record?.pipeline_id ?? defaultPipelineId ?? '',
    contactId: record?.contact_id ?? '',
    accountId: record?.account_id ?? '',
    quoteId: record?.quote_id ?? '',
    name: record?.name ?? '',
    stage: record?.stage ?? 'identified',
    value: record?.value != null ? String(record.value) : '',
    probability: record?.probability != null ? String(record.probability) : '',
    expectedClose: record?.expected_close ?? '',
    owner: record?.owner ?? '',
  };
}

function validateDealValues(values: DealMutationValues): DealFormErrors {
  const errors: DealFormErrors = {};
  if (!values.name.trim()) errors.name = 'Deal name is required.';
  if (!values.pipelineId) errors.pipelineId = 'Pipeline is required.';
  return errors;
}

export function AdminDealForm({
  contacts,
  accounts,
  pipelines,
  quotes,
  initialRecord,
  onCancel,
  onSave,
}: {
  contacts: ContactRecord[];
  accounts: AccountRecord[];
  pipelines: PipelineRecord[];
  quotes: AdminQuoteRecord[];
  initialRecord?: SalesDealRecord | null;
  onCancel: () => void;
  onSave: (values: DealMutationValues) => Promise<void>;
}) {
  const defaultPipelineId = pipelines.find((p) => p.is_default)?.id ?? pipelines[0]?.id ?? '';
  const [values, setValues] = useState<DealMutationValues>(buildDealValues(initialRecord, defaultPipelineId));
  const [errors, setErrors] = useState<DealFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildDealValues(initialRecord, defaultPipelineId));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord, defaultPipelineId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDealValues(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the deal.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Deal Name</label>
        <Input
          value={values.name}
          onChange={(e) => { setValues((v) => ({ ...v, name: e.target.value })); setErrors((e2) => ({ ...e2, name: undefined })); }}
          placeholder="e.g. Salesforce CPQ Implementation"
          disabled={isSaving}
        />
        <FormError message={errors.name} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Stage</label>
          <Select
            value={values.stage}
            onValueChange={(v) => setValues((prev) => ({ ...prev, stage: v as DealMutationValues['stage'] }))}
            disabled={isSaving}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DEAL_STAGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Pipeline</label>
          <Select
            value={values.pipelineId || undefined}
            onValueChange={(v) => { setValues((prev) => ({ ...prev, pipelineId: v })); setErrors((e2) => ({ ...e2, pipelineId: undefined })); }}
            disabled={isSaving}
          >
            <SelectTrigger><SelectValue placeholder="Select pipeline" /></SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormError message={errors.pipelineId} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Contact</label>
          <Select
            value={values.contactId || undefined}
            onValueChange={(v) => {
              const c = contacts.find((ct) => ct.id === v);
              setValues((prev) => ({
                ...prev,
                contactId: v,
                accountId: c?.account_id ?? prev.accountId,
              }));
            }}
            disabled={isSaving}
          >
            <SelectTrigger><SelectValue placeholder="Select contact (optional)" /></SelectTrigger>
            <SelectContent>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id}>{getContactDisplayName(c)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Account</label>
          <Select
            value={values.accountId || undefined}
            onValueChange={(v) => setValues((prev) => ({ ...prev, accountId: v }))}
            disabled={isSaving}
          >
            <SelectTrigger><SelectValue placeholder="Select account (optional)" /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Value (USD)</label>
          <Input
            type="number"
            min="0"
            step="1000"
            value={values.value}
            onChange={(e) => setValues((v) => ({ ...v, value: e.target.value }))}
            placeholder="e.g. 75000"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Probability (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={values.probability}
            onChange={(e) => setValues((v) => ({ ...v, probability: e.target.value }))}
            placeholder="e.g. 60"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Expected Close</label>
          <Input
            type="date"
            value={values.expectedClose}
            onChange={(e) => setValues((v) => ({ ...v, expectedClose: e.target.value }))}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Owner</label>
          <Input
            value={values.owner}
            onChange={(e) => setValues((v) => ({ ...v, owner: e.target.value }))}
            placeholder="Owner name or email"
            disabled={isSaving}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Linked Quote</label>
          <Select
            value={values.quoteId || undefined}
            onValueChange={(v) => setValues((prev) => ({ ...prev, quoteId: v }))}
            disabled={isSaving}
          >
            <SelectTrigger><SelectValue placeholder="Link to quote (optional)" /></SelectTrigger>
            <SelectContent>
              {quotes.map((q) => (
                <SelectItem key={q.id} value={q.id}>
                  {q.metadata.company_name || q.client?.company_name || q.id.slice(0, 8)} — {formatCurrency(q.estimated_budget_min)} to {formatCurrency(q.estimated_budget_max)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {initialRecord?.updated_at && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Last Updated</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDateTime(initialRecord.updated_at)}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button type="submit" disabled={isSaving} className="bkt-primary-button rounded-xl">
          {isSaving ? 'Saving…' : initialRecord ? 'Save Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
}
