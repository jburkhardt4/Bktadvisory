import { mockActivityEvents } from '../../mocks/portalData';
import type { ActivityEvent, ActivityEventType } from '../../types/portal';

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function EventIcon({ type }: { type: ActivityEventType }) {
  // Quote events
  if (type === 'quote_generated' || type === 'quote_sent' || type === 'quote_revised' || type === 'quote_accepted') {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    );
  }
  // Project created
  if (type === 'project_created') {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <line x1="12" y1="11" x2="12" y2="17" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    );
  }
  // Discovery / scope
  if (type === 'discovery_completed' || type === 'scope_approved') {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  // Design / build
  if (type === 'design_started' || type === 'build_started') {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 7.76a6 6 0 0 0 0 8.49" />
      </svg>
    );
  }
  // Client feedback
  if (type === 'client_feedback_requested' || type === 'client_feedback_received') {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  // Blocked / unblocked
  if (type === 'blocked' || type === 'unblocked') {
    return (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  // UAT / completed / archived
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function iconBgForType(type: ActivityEventType): string {
  if (type === 'quote_generated' || type === 'quote_sent' || type === 'quote_revised' || type === 'quote_accepted') {
    return 'bg-indigo-500/20 text-indigo-400';
  }
  if (type === 'project_created') return 'bg-sky-500/20 text-sky-400';
  if (type === 'discovery_completed' || type === 'scope_approved') return 'bg-amber-500/20 text-amber-400';
  if (type === 'design_started' || type === 'build_started') return 'bg-blue-500/20 text-blue-400';
  if (type === 'client_feedback_requested' || type === 'client_feedback_received') return 'bg-violet-500/20 text-violet-400';
  if (type === 'blocked' || type === 'unblocked') return 'bg-red-500/20 text-red-400';
  return 'bg-emerald-500/20 text-emerald-400';
}

function TimelineEvent({ event, isLast }: { event: ActivityEvent; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* Icon + connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgForType(event.type)}`}>
          <EventIcon type={event.type} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700/50 mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-5 min-w-0 flex-1 ${isLast ? '' : ''}`}>
        <p className="text-slate-300 text-sm leading-snug">{event.description}</p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
          <span>{event.actor}</span>
          <span>·</span>
          <span>{relativeTime(event.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

export function ActivityTimeline() {
  const sorted = [...mockActivityEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sorted.length === 0) {
    return <div className="py-8 text-center text-slate-500 text-sm">No activity recorded.</div>;
  }

  return (
    <div>
      {sorted.map((event, idx) => (
        <TimelineEvent key={event.id} event={event} isLast={idx === sorted.length - 1} />
      ))}
    </div>
  );
}
