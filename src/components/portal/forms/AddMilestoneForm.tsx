import { useState } from 'react';
import { supabase } from '../../../supabase/client';

interface AddMilestoneFormProps {
  onClose: () => void;
  projectId?: string;
  onSuccess?: () => void | Promise<void>;
}

export function AddMilestoneForm({ onClose, projectId, onSuccess }: AddMilestoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: insertError } = await supabase.from('milestones').insert({
      project_id: projectId ?? '',
      title: title.trim(),
      description: description.trim() || undefined,
      target_date: date,
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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Milestone Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="e.g. UAT Sign-off"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="Brief description of this milestone…"
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
          {isSubmitting ? 'Adding…' : 'Add Milestone'}
        </button>
      </div>
    </form>
  );
}
