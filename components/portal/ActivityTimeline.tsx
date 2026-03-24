import { mockActivity } from './portalData';
import { QUOTE_STATUS_CONFIG, PROJECT_STATUS_CONFIG } from './portalData';
import type { QuoteStatus, ProjectStatus } from './portalData';
import { FileTextIcon, FolderIcon, AlertCircleIcon } from './PortalIcons';

function getStatusConfig(event: typeof mockActivity[0]) {
  if (event.type === 'quote' && event.status) return QUOTE_STATUS_CONFIG[event.status as QuoteStatus];
  if (event.type === 'project' && event.status) return PROJECT_STATUS_CONFIG[event.status as ProjectStatus];
  return null;
}

function EventIcon({ type }: { type: string }) {
  if (type === 'quote') return <FileTextIcon size={14} />;
  if (type === 'project') return <FolderIcon size={14} />;
  return <AlertCircleIcon size={14} />;
}

function timeAgo(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ActivityTimeline() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Recent Activity</h3>
      </div>
      <div className="px-6 py-4 space-y-0">
        {mockActivity.map((event, i) => {
          const cfg = getStatusConfig(event);
          return (
            <div key={event.id} className="flex gap-4">
              {/* Timeline rail */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  cfg ? `${cfg.bg} ${cfg.color}` : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <EventIcon type={event.type} />
                </div>
                {i < mockActivity.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
              </div>
              {/* Content */}
              <div className="pb-5 min-w-0 pt-1">
                <p className="text-sm font-medium text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(event.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}