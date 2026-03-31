import { useState } from 'react';
import { supabase } from '../../../supabase/client';
import { useAuth } from '../../../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { Database } from '../../../types/supabase';

type ActivityEventType = Database['public']['Enums']['activity_event_type'];

const EVENT_TYPES: { value: ActivityEventType; label: string }[] = [
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

interface AddActivityFormProps {
  onClose: () => void;
  projectId?: string;
  onSuccess?: () => void | Promise<void>;
}

export function AddActivityForm({
  onClose,
  projectId: initialProjectId,
  onSuccess,
}: AddActivityFormProps) {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<ActivityEventType>('project_created');
  const [projectId, setProjectId] = useState(initialProjectId ?? '');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: insertError } = await supabase.from('activity_events').insert({
      type,
      record_id: projectId.trim(),
      description: description.trim() || undefined,
      actor: session?.user?.email ?? 'unknown',
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await onSuccess?.();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Activity Type</label>
        <Select
          value={type}
          onValueChange={v => setType(v as ActivityEventType)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="w-full rounded-lg border-blue-200 bg-blue-50 text-slate-800 font-medium dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!initialProjectId && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project ID</label>
          <input
            type="text"
            required
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder="e.g. PRJ-001"
            disabled={isSubmitting}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="Describe the activity…"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-200 dark:hover:bg-slate-800">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bkt-primary-button disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Adding…' : 'Add Activity'}
        </button>
      </div>
    </form>
  );
}
