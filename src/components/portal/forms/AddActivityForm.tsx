import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
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
}

export function AddActivityForm({ onClose, projectId: initialProjectId }: AddActivityFormProps) {
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
      project_id: projectId.trim(),
      description: description.trim() || undefined,
      actor: session?.user?.email ?? 'unknown',
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Activity Type</label>
        <select
          required
          value={type}
          onChange={e => setType(e.target.value as ActivityEventType)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={isSubmitting}
        >
          {EVENT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {!initialProjectId && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
          <input
            type="text"
            required
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. PRJ-001"
            disabled={isSubmitting}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Describe the activity…"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding…' : 'Add Activity'}
        </button>
      </div>
    </form>
  );
}
