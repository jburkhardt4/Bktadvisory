import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { FileTextIcon, FolderIcon, AlertCircleIcon } from './PortalIcons';
import type { Database } from '../../types/supabase';

type ActivityEventType = Database['public']['Enums']['activity_event_type'];

interface Activity {
  id: string;
  type: ActivityEventType;
  client_id: string | null;
  record_id: string;
  description: string;
  actor: string | null;
  created_at: string;
}

const QUOTE_TYPES: Set<ActivityEventType> = new Set([
  'quote_generated', 'quote_sent', 'quote_revised', 'quote_accepted',
]);

const ALERT_TYPES: Set<ActivityEventType> = new Set([
  'blocked', 'unblocked', 'client_feedback_requested', 'client_feedback_received',
]);

const EVENT_STYLE: Record<string, { color: string; bg: string }> = {
  quote: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  alert: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  project: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
};

function getEventCategory(type: ActivityEventType): string {
  if (QUOTE_TYPES.has(type)) return 'quote';
  if (ALERT_TYPES.has(type)) return 'alert';
  return 'project';
}

function formatEventTitle(type: ActivityEventType): string {
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EventIcon({ type }: { type: ActivityEventType }) {
  const cat = getEventCategory(type);
  if (cat === 'quote') return <FileTextIcon size={14} />;
  if (cat === 'alert') return <AlertCircleIcon size={14} />;
  return <FolderIcon size={14} />;
}

export function ActivityTimeline() {
  const { session, role } = useAuth();
  const user = session?.user ?? null;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      if (!user) return;

      try {
        let query = supabase
          .from('activity_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);

        if (role === 'client') {
          query = query.eq('client_id', user.id);
        }

        const { data, error: evtErr } = await query;
        if (evtErr) throw evtErr;
        setActivities((data as Activity[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [user, role]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="h-4 w-32 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
        </div>
        <div className="px-6 py-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 animate-pulse dark:bg-slate-800" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 w-3/4 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                <div className="h-3 w-full rounded bg-slate-100 animate-pulse dark:bg-slate-900" />
                <div className="h-3 w-20 rounded bg-slate-100 animate-pulse dark:bg-slate-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Recent Activity</h3>
        </div>
        <div className="px-6 py-10 text-center">
          <div className="text-slate-400 dark:text-slate-500">
            <AlertCircleIcon size={24} />
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Unable to load activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Recent Activity</h3>
      </div>
      {activities.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">No recent activity</p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-0">
          {activities.map((event, i) => {
            const cat = getEventCategory(event.type);
            const style = EVENT_STYLE[cat];
            return (
              <div key={event.id} className="flex gap-4">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${style.bg} ${style.color}`}>
                    <EventIcon type={event.type} />
                  </div>
                  {i < activities.length - 1 && <div className="my-1 w-px flex-1 bg-slate-200 dark:bg-slate-800" />}
                </div>
                {/* Content */}
                <div className="pb-5 min-w-0 pt-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatEventTitle(event.type)}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{event.description}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatDate(event.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
