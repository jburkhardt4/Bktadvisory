import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ACTIVITY_TYPE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  QUOTE_STATUS_OPTIONS,
  getProfileDisplayName,
  getProfileSummary,
  type ActivityMutationValues,
  type AdminActivityRecord,
  type AdminMilestoneRecord,
  type AdminProjectRecord,
  type AdminQuoteRecord,
  type MilestoneMutationValues,
  type ProfileRecord,
  type ProjectMutationValues,
  type ProjectRecord,
  type QuoteMutationValues,
} from './adminCrmApi';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

type QuoteFormErrors = Partial<Record<keyof QuoteMutationValues, string>>;
type ProjectFormErrors = Partial<Record<keyof ProjectMutationValues, string>>;
type ActivityFormErrors = Partial<Record<keyof ActivityMutationValues, string>>;
type MilestoneFormErrors = Partial<Record<keyof MilestoneMutationValues, string>>;

interface AdminQuoteFormProps {
  clients: ProfileRecord[];
  initialRecord?: AdminQuoteRecord | null;
  onCancel: () => void;
  onSave: (values: QuoteMutationValues) => Promise<void>;
}

interface AdminProjectFormProps {
  clients: ProfileRecord[];
  initialRecord?: AdminProjectRecord | null;
  onCancel: () => void;
  onSave: (values: ProjectMutationValues) => Promise<void>;
}

interface AdminActivityFormProps {
  projects: ProjectRecord[];
  initialRecord?: AdminActivityRecord | null;
  onCancel: () => void;
  onSave: (values: ActivityMutationValues) => Promise<void>;
}

interface AdminMilestoneFormProps {
  projects: ProjectRecord[];
  initialRecord?: AdminMilestoneRecord | null;
  onCancel: () => void;
  onSave: (values: MilestoneMutationValues) => Promise<void>;
}

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

function buildQuoteValues(record?: AdminQuoteRecord | null): QuoteMutationValues {
  return {
    clientId: record?.client_id ?? '',
    status: record?.status ?? 'draft',
    estimatedBudgetMin:
      record?.estimated_budget_min != null ? String(record.estimated_budget_min) : '',
    estimatedBudgetMax:
      record?.estimated_budget_max != null ? String(record.estimated_budget_max) : '',
    clientName: record
      ? record.metadata.client_name ?? getProfileDisplayName(record.client)
      : '',
    companyName:
      record?.metadata.company_name ??
      record?.client?.company_name ??
      '',
    description: record?.metadata.description ?? '',
  };
}

function buildProjectValues(record?: AdminProjectRecord | null): ProjectMutationValues {
  return {
    clientId: record?.client_id ?? '',
    name: record?.name ?? '',
    companyName: record?.company_name ?? '',
    description: record?.description ?? '',
    owner: record?.owner ?? '',
    status: record?.status ?? 'intake',
    targetMilestone: record?.target_milestone ?? '',
  };
}

function buildActivityValues(record?: AdminActivityRecord | null): ActivityMutationValues {
  return {
    projectId: record?.record_id ?? '',
    type: record?.type ?? 'project_created',
    description: record?.description ?? '',
    actor: record?.actor ?? '',
  };
}

function buildMilestoneValues(record?: AdminMilestoneRecord | null): MilestoneMutationValues {
  return {
    projectId: record?.project_id ?? '',
    title: record?.title ?? '',
    description: record?.description ?? '',
    targetDate: record?.target_date ?? '',
    completed: record?.completed ?? false,
  };
}

function validateQuoteValues(values: QuoteMutationValues): QuoteFormErrors {
  const errors: QuoteFormErrors = {};
  const minBudget = values.estimatedBudgetMin.trim();
  const maxBudget = values.estimatedBudgetMax.trim();
  const parsedMin = minBudget ? Number.parseFloat(minBudget) : null;
  const parsedMax = maxBudget ? Number.parseFloat(maxBudget) : null;

  if (!values.clientId) {
    errors.clientId = 'Choose the related client.';
  }

  if (!values.clientName.trim()) {
    errors.clientName = 'Enter the client contact name.';
  }

  if (!values.companyName.trim()) {
    errors.companyName = 'Enter the company name.';
  }

  if (!minBudget && !maxBudget) {
    errors.estimatedBudgetMin = 'Add at least one budget value.';
  }

  if (minBudget && (parsedMin == null || parsedMin < 0)) {
    errors.estimatedBudgetMin = 'Enter a valid minimum budget.';
  }

  if (maxBudget && (parsedMax == null || parsedMax < 0)) {
    errors.estimatedBudgetMax = 'Enter a valid maximum budget.';
  }

  if (parsedMin != null && parsedMax != null && parsedMin > parsedMax) {
    errors.estimatedBudgetMax = 'Maximum budget must be greater than or equal to the minimum.';
  }

  return errors;
}

function validateProjectValues(values: ProjectMutationValues): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  if (!values.clientId) {
    errors.clientId = 'Choose the related client.';
  }

  if (!values.name.trim()) {
    errors.name = 'Enter the project name.';
  }

  if (!values.companyName.trim()) {
    errors.companyName = 'Enter the company name.';
  }

  if (!values.owner.trim()) {
    errors.owner = 'Enter the project owner.';
  }

  return errors;
}

function validateActivityValues(values: ActivityMutationValues): ActivityFormErrors {
  const errors: ActivityFormErrors = {};

  if (!values.projectId) {
    errors.projectId = 'Choose the related project.';
  }

  if (!values.description.trim()) {
    errors.description = 'Add a short description for the activity.';
  }

  return errors;
}

function validateMilestoneValues(values: MilestoneMutationValues): MilestoneFormErrors {
  const errors: MilestoneFormErrors = {};

  if (!values.projectId) {
    errors.projectId = 'Choose the related project.';
  }

  if (!values.title.trim()) {
    errors.title = 'Enter the milestone title.';
  }

  if (!values.targetDate) {
    errors.targetDate = 'Choose the target date.';
  }

  return errors;
}

export function AdminQuoteForm({
  clients,
  initialRecord,
  onCancel,
  onSave,
}: AdminQuoteFormProps) {
  const [values, setValues] = useState<QuoteMutationValues>(buildQuoteValues(initialRecord));
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildQuoteValues(initialRecord));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateQuoteValues(values);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);

    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the quote.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Related Client</label>
        <Select
          value={values.clientId || undefined}
          onValueChange={(nextClientId) => {
            const selectedClient = clients.find((client) => client.id === nextClientId) ?? null;

            setValues((currentValues) => ({
              ...currentValues,
              clientId: nextClientId,
              clientName: getProfileDisplayName(selectedClient),
              companyName: selectedClient?.company_name ?? currentValues.companyName,
            }));
            setErrors((currentErrors) => ({ ...currentErrors, clientId: undefined }));
          }}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {getProfileSummary(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError message={errors.clientId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <Select
            value={values.status}
            onValueChange={(nextStatus) => {
              setValues((currentValues) => ({
                ...currentValues,
                status: nextStatus as QuoteMutationValues['status'],
              }));
            }}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUOTE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Client Contact</label>
          <Input
            value={values.clientName}
            onChange={(event) => {
              setValues((currentValues) => ({ ...currentValues, clientName: event.target.value }));
              setErrors((currentErrors) => ({ ...currentErrors, clientName: undefined }));
            }}
            placeholder="Primary contact name"
            disabled={isSaving}
          />
          <FormError message={errors.clientName} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Company Name</label>
        <Input
          value={values.companyName}
          onChange={(event) => {
            setValues((currentValues) => ({ ...currentValues, companyName: event.target.value }));
            setErrors((currentErrors) => ({ ...currentErrors, companyName: undefined }));
          }}
          placeholder="Client company name"
          disabled={isSaving}
        />
        <FormError message={errors.companyName} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Budget Minimum</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={values.estimatedBudgetMin}
            onChange={(event) => {
              setValues((currentValues) => ({
                ...currentValues,
                estimatedBudgetMin: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                estimatedBudgetMin: undefined,
              }));
            }}
            placeholder="25000"
            disabled={isSaving}
          />
          <FormError message={errors.estimatedBudgetMin} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Budget Maximum</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={values.estimatedBudgetMax}
            onChange={(event) => {
              setValues((currentValues) => ({
                ...currentValues,
                estimatedBudgetMax: event.target.value,
              }));
              setErrors((currentErrors) => ({
                ...currentErrors,
                estimatedBudgetMax: undefined,
              }));
            }}
            placeholder="50000"
            disabled={isSaving}
          />
          <FormError message={errors.estimatedBudgetMax} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
        <Textarea
          value={values.description}
          onChange={(event) => {
            setValues((currentValues) => ({ ...currentValues, description: event.target.value }));
          }}
          placeholder="Summarize the quote scope or notes"
          className="min-h-24"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? 'Saving…' : initialRecord ? 'Save Quote' : 'Create Quote'}
        </Button>
      </div>
    </form>
  );
}

export function AdminProjectForm({
  clients,
  initialRecord,
  onCancel,
  onSave,
}: AdminProjectFormProps) {
  const [values, setValues] = useState<ProjectMutationValues>(buildProjectValues(initialRecord));
  const [errors, setErrors] = useState<ProjectFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildProjectValues(initialRecord));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProjectValues(values);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);

    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the project.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Related Client</label>
        <Select
          value={values.clientId || undefined}
          onValueChange={(nextClientId) => {
            const selectedClient = clients.find((client) => client.id === nextClientId) ?? null;

            setValues((currentValues) => ({
              ...currentValues,
              clientId: nextClientId,
              companyName: selectedClient?.company_name ?? currentValues.companyName,
            }));
            setErrors((currentErrors) => ({ ...currentErrors, clientId: undefined }));
          }}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {getProfileSummary(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError message={errors.clientId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Project Name</label>
          <Input
            value={values.name}
            onChange={(event) => {
              setValues((currentValues) => ({ ...currentValues, name: event.target.value }));
              setErrors((currentErrors) => ({ ...currentErrors, name: undefined }));
            }}
            placeholder="Project name"
            disabled={isSaving}
          />
          <FormError message={errors.name} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Company Name</label>
          <Input
            value={values.companyName}
            onChange={(event) => {
              setValues((currentValues) => ({
                ...currentValues,
                companyName: event.target.value,
              }));
              setErrors((currentErrors) => ({ ...currentErrors, companyName: undefined }));
            }}
            placeholder="Company name"
            disabled={isSaving}
          />
          <FormError message={errors.companyName} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Owner</label>
          <Input
            value={values.owner}
            onChange={(event) => {
              setValues((currentValues) => ({ ...currentValues, owner: event.target.value }));
              setErrors((currentErrors) => ({ ...currentErrors, owner: undefined }));
            }}
            placeholder="Owner email or name"
            disabled={isSaving}
          />
          <FormError message={errors.owner} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <Select
            value={values.status}
            onValueChange={(nextStatus) => {
              setValues((currentValues) => ({
                ...currentValues,
                status: nextStatus as ProjectMutationValues['status'],
              }));
            }}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Target Milestone</label>
        <Input
          value={values.targetMilestone}
          onChange={(event) => {
            setValues((currentValues) => ({
              ...currentValues,
              targetMilestone: event.target.value,
            }));
          }}
          placeholder="Current target milestone"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
        <Textarea
          value={values.description}
          onChange={(event) => {
            setValues((currentValues) => ({
              ...currentValues,
              description: event.target.value,
            }));
          }}
          placeholder="Project scope, goals, or delivery notes"
          className="min-h-28"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? 'Saving…' : initialRecord ? 'Save Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}

export function AdminActivityForm({
  projects,
  initialRecord,
  onCancel,
  onSave,
}: AdminActivityFormProps) {
  const [values, setValues] = useState<ActivityMutationValues>(buildActivityValues(initialRecord));
  const [errors, setErrors] = useState<ActivityFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildActivityValues(initialRecord));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateActivityValues(values);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);

    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the activity.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Project</label>
        <Select
          value={values.projectId || undefined}
          onValueChange={(nextProjectId) => {
            setValues((currentValues) => ({ ...currentValues, projectId: nextProjectId }));
            setErrors((currentErrors) => ({ ...currentErrors, projectId: undefined }));
          }}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} · {project.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError message={errors.projectId} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Activity Type</label>
          <Select
            value={values.type}
            onValueChange={(nextType) => {
              setValues((currentValues) => ({
                ...currentValues,
                type: nextType as ActivityMutationValues['type'],
              }));
            }}
            disabled={isSaving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Actor</label>
          <Input
            value={values.actor}
            onChange={(event) => {
              setValues((currentValues) => ({ ...currentValues, actor: event.target.value }));
            }}
            placeholder="Actor or system name"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
        <Textarea
          value={values.description}
          onChange={(event) => {
            setValues((currentValues) => ({
              ...currentValues,
              description: event.target.value,
            }));
            setErrors((currentErrors) => ({ ...currentErrors, description: undefined }));
          }}
          placeholder="Summarize what happened"
          className="min-h-28"
          disabled={isSaving}
        />
        <FormError message={errors.description} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? 'Saving…' : initialRecord ? 'Save Activity' : 'Create Activity'}
        </Button>
      </div>
    </form>
  );
}

export function AdminMilestoneForm({
  projects,
  initialRecord,
  onCancel,
  onSave,
}: AdminMilestoneFormProps) {
  const [values, setValues] = useState<MilestoneMutationValues>(buildMilestoneValues(initialRecord));
  const [errors, setErrors] = useState<MilestoneFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValues(buildMilestoneValues(initialRecord));
    setErrors({});
    setSubmitError(null);
  }, [initialRecord]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateMilestoneValues(values);
    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);

    try {
      await onSave(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'We could not save the milestone.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormAlert message={submitError} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Project</label>
        <Select
          value={values.projectId || undefined}
          onValueChange={(nextProjectId) => {
            setValues((currentValues) => ({ ...currentValues, projectId: nextProjectId }));
            setErrors((currentErrors) => ({ ...currentErrors, projectId: undefined }));
          }}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} · {project.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError message={errors.projectId} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Milestone Title</label>
        <Input
          value={values.title}
          onChange={(event) => {
            setValues((currentValues) => ({ ...currentValues, title: event.target.value }));
            setErrors((currentErrors) => ({ ...currentErrors, title: undefined }));
          }}
          placeholder="Milestone title"
          disabled={isSaving}
        />
        <FormError message={errors.title} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Target Date</label>
          <Input
            type="date"
            value={values.targetDate}
            onChange={(event) => {
              setValues((currentValues) => ({
                ...currentValues,
                targetDate: event.target.value,
              }));
              setErrors((currentErrors) => ({ ...currentErrors, targetDate: undefined }));
            }}
            disabled={isSaving}
          />
          <FormError message={errors.targetDate} />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800">
          <Checkbox
            checked={values.completed}
            onCheckedChange={(checked) => {
              setValues((currentValues) => ({
                ...currentValues,
                completed: checked === true,
              }));
            }}
            disabled={isSaving}
          />
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Completed</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mark this milestone as completed.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
        <Textarea
          value={values.description}
          onChange={(event) => {
            setValues((currentValues) => ({
              ...currentValues,
              description: event.target.value,
            }));
          }}
          placeholder="Milestone details"
          className="min-h-24"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? 'Saving…' : initialRecord ? 'Save Milestone' : 'Create Milestone'}
        </Button>
      </div>
    </form>
  );
}
