import { useState } from 'react';
import { supabase } from '../../../supabase/client';
import { useAuth } from '../../../contexts/AuthContext';

interface CreateProjectFormProps {
  onClose: () => void;
}

export function CreateProjectForm({ onClose }: CreateProjectFormProps) {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [owner, setOwner] = useState(session?.user?.email ?? '');
  const [targetMilestone, setTargetMilestone] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: insertError } = await supabase.from('projects').insert({
      name: name.trim(),
      company_name: companyName.trim(),
      owner: owner.trim(),
      target_milestone: targetMilestone.trim() || undefined,
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. Website Redesign"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
        <input
          type="text"
          required
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. Acme Corp"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
        <input
          type="text"
          required
          value={owner}
          onChange={e => setOwner(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Project lead name or email"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Target Milestone</label>
        <input
          type="text"
          value={targetMilestone}
          onChange={e => setTargetMilestone(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. MVP Launch (optional)"
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
          {isSubmitting ? 'Creating…' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
