import { useParams, Link } from 'react-router';
import type { ActivityEventType, ProjectStatus } from '../../types/portal';
import { mockProjects, mockActivityEvents } from '../../mocks/portalData';
import { StatusRail } from './StatusRail';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = {
    pdf: '#ef4444',
    png: '#3b82f6',
    jpg: '#3b82f6',
    docx: '#2563eb',
    doc: '#2563eb',
  };
  const color = colors[ext] ?? '#94a3b8';
  return (
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
      <rect x="0" y="0" width="20" height="24" rx="3" fill="#1e293b" />
      <rect x="0" y="0" width="20" height="24" rx="3" stroke="#334155" strokeWidth="1" />
      <text x="10" y="16" textAnchor="middle" fontSize="7" fontWeight="bold" fill={color} fontFamily="sans-serif">
        {ext.toUpperCase()}
      </text>
    </svg>
  );
}

// ─── Helper: event type → icon ────────────────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityEventType }) {
  const quoteEvents: ActivityEventType[] = ['quote_generated', 'quote_sent', 'quote_revised', 'quote_accepted'];
  const searchEvents: ActivityEventType[] = ['discovery_completed', 'scope_approved'];
  const buildEvents: ActivityEventType[] = ['design_started', 'build_started'];
  const chatEvents: ActivityEventType[] = ['client_feedback_requested', 'client_feedback_received'];
  const alertEvents: ActivityEventType[] = ['blocked', 'unblocked'];
  const checkEvents: ActivityEventType[] = ['uat_started', 'completed', 'archived'];

  if (quoteEvents.includes(type)) return <DocumentIcon />;
  if (type === 'project_created') return <FolderIcon />;
  if (searchEvents.includes(type)) return <SearchIcon />;
  if (buildEvents.includes(type)) return <WrenchIcon />;
  if (chatEvents.includes(type)) return <ChatIcon />;
  if (alertEvents.includes(type)) return <AlertIcon />;
  if (checkEvents.includes(type)) return <CheckCircleIcon />;
  return <DocumentIcon />;
}

function activityIconBg(type: ActivityEventType): string {
  const alertEvents: ActivityEventType[] = ['blocked'];
  const warningEvents: ActivityEventType[] = ['client_feedback_requested'];
  const successEvents: ActivityEventType[] = ['completed', 'scope_approved', 'uat_started'];
  if (alertEvents.includes(type)) return 'bg-red-500/20 text-red-400';
  if (warningEvents.includes(type)) return 'bg-amber-500/20 text-amber-400';
  if (successEvents.includes(type)) return 'bg-green-500/20 text-green-400';
  return 'bg-blue-600/20 text-blue-400';
}

// ─── Helper: status chip styling ─────────────────────────────────────────────

function statusChipClass(status: ProjectStatus): string {
  switch (status) {
    case 'blocked': return 'bg-red-600/20 border-red-500/40 text-red-400';
    case 'awaiting_client': return 'bg-amber-500/20 border-amber-400/40 text-amber-400';
    case 'completed': return 'bg-green-600/20 border-green-500/40 text-green-400';
    case 'archived': return 'bg-slate-600/20 border-slate-500/40 text-slate-400';
    case 'uat': return 'bg-purple-600/20 border-purple-500/40 text-purple-400';
    default: return 'bg-blue-600/20 border-blue-500/40 text-blue-400';
  }
}

function statusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    intake: 'Intake',
    discovery: 'Discovery',
    scoping: 'Scoping',
    design_in_progress: 'Design In Progress',
    build_in_progress: 'Build In Progress',
    awaiting_client: 'Awaiting Client',
    blocked: 'Blocked',
    uat: 'UAT',
    completed: 'Completed',
    archived: 'Archived',
  };
  return labels[status] ?? status;
}

// ─── Helper: date formatting ──────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ─── Mock blocker items ───────────────────────────────────────────────────────

const MOCK_BLOCKERS = [
  {
    id: 'blk-1',
    title: 'Awaiting approval on design mockups',
    dueDate: '2026-03-25',
  },
  {
    id: 'blk-2',
    title: 'Awaiting client credentials for Salesforce sandbox',
    dueDate: '2026-03-22',
  },
  {
    id: 'blk-3',
    title: 'Awaiting content for email templates',
    dueDate: '2026-03-28',
  },
];

// ─── Mock documents ───────────────────────────────────────────────────────────

const MOCK_DOCUMENTS = [
  { id: 'doc-1', name: 'Project Scope Document — v2.1.pdf', ext: 'pdf', uploadedAt: '2026-03-05' },
  { id: 'doc-2', name: 'Architecture Diagram.png', ext: 'png', uploadedAt: '2026-02-28' },
  { id: 'doc-3', name: 'Client Requirements Brief.docx', ext: 'docx', uploadedAt: '2026-02-15' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const project = mockProjects.find((p) => p.id === projectId);

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-[#0F172B] text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
            <p className="text-slate-400 text-sm">
              No project exists with ID <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">{projectId}</code>. It may have been removed or the link may be incorrect.
            </p>
          </div>
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon />
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  // Filter and sort activity events for this project (newest first)
  const projectEvents = mockActivityEvents
    .filter((e) => e.projectId === project.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const recentMilestones = projectEvents.slice(0, 3);

  const isBlockedOrAwaiting =
    project.status === 'blocked' || project.status === 'awaiting_client';

  const blockerPanelColor =
    project.status === 'blocked'
      ? { border: 'border-red-500/30', header: 'text-red-400', iconBg: 'bg-red-500/10 text-red-400', cardBorder: 'border-red-500/20', dot: 'bg-red-500' }
      : { border: 'border-amber-500/30', header: 'text-amber-400', iconBg: 'bg-amber-500/10 text-amber-400', cardBorder: 'border-amber-400/20', dot: 'bg-amber-400' };

  return (
    <div className="min-h-screen bg-[#0F172B] text-white">
      {/* ─── Top Nav Bar ───────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-[#0F172B]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeftIcon />
            Back to Portal
          </Link>
          <span className="text-xs text-slate-600 hidden sm:block">BKT Advisory — Client Portal</span>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ═══ LEFT COLUMN (65%) ═════════════════════════════════════ */}
          <div className="flex-1 lg:w-0 space-y-6">

            {/* ── A. Project Header ───────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white leading-tight">{project.name}</h1>
                  <p className="text-slate-400 text-sm mt-1">{project.companyName}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${statusChipClass(project.status)}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    project.status === 'blocked' ? 'bg-red-500' :
                    project.status === 'awaiting_client' ? 'bg-amber-400' :
                    project.status === 'completed' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`} />
                  {statusLabel(project.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-slate-500">Owner:</span>
                  <span className="text-slate-300">{project.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                  <span className="text-slate-500">Milestone:</span>
                  <span className="text-slate-300">{project.targetMilestone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-300">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <ClockIcon />
                  <span className="text-slate-500">Last updated:</span>
                  <span className="text-slate-300">{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* ── B. Lifecycle Status Rail ────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
                Project Lifecycle
              </h2>
              <StatusRail currentStatus={project.status} />
            </div>

            {/* ── C. Activity Timeline ────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
                Activity Timeline
              </h2>

              {projectEvents.length === 0 ? (
                <p className="text-slate-500 text-sm">No activity recorded for this project yet.</p>
              ) : (
                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-700" />

                  <div className="space-y-0">
                    {projectEvents.map((event) => (
                      <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Icon circle */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activityIconBg(event.type)}`}>
                          <ActivityIcon type={event.type} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-slate-200 text-sm leading-relaxed">{event.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-400">{event.actor}</span>
                            <span>·</span>
                            <span>{formatDateTime(event.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT COLUMN (35%) ════════════════════════════════════ */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-6">

            {/* ── D. Blockers / Awaiting Client Panel ─────────────── */}
            <div className={`bg-slate-900/60 border rounded-xl p-5 ${isBlockedOrAwaiting ? blockerPanelColor.border : 'border-slate-800'}`}>
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isBlockedOrAwaiting ? blockerPanelColor.header : 'text-slate-400'}`}>
                {isBlockedOrAwaiting
                  ? project.status === 'blocked' ? 'Blocked — Action Required' : 'Awaiting Client'
                  : 'Action Items'}
              </h2>

              {isBlockedOrAwaiting ? (
                <div className="space-y-3">
                  {MOCK_BLOCKERS.map((blocker) => (
                    <div
                      key={blocker.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border bg-slate-800/50 ${blockerPanelColor.cardBorder}`}
                    >
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${blockerPanelColor.iconBg}`}>
                        <AlertIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm">{blocker.title}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <ClockIcon />
                          <span>Due {formatDate(blocker.dueDate)}</span>
                          <span className="ml-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                              project.status === 'blocked'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${blockerPanelColor.dot}`} />
                              Pending
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                    <CheckCircleIcon />
                  </div>
                  <p className="text-green-400 text-sm font-medium">All clear — no blockers</p>
                </div>
              )}
            </div>

            {/* ── E. Recent Milestones ─────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Recent Milestones
              </h2>

              {recentMilestones.length === 0 ? (
                <p className="text-slate-500 text-sm">No milestones recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentMilestones.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mt-0.5">
                        <CheckIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300 text-sm leading-snug line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <span>{formatDate(event.timestamp)}</span>
                          <span>·</span>
                          <span>{event.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── F. Documents & Files ─────────────────────────────── */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Documents &amp; Files
              </h2>

              <div className="space-y-2 mb-4">
                {MOCK_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex-shrink-0">
                      <FileIcon ext={doc.ext} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-xs font-medium leading-snug truncate">{doc.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Uploaded {formatDate(doc.uploadedAt)}</p>
                    </div>
                    <button
                      disabled
                      className="flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700/40">
                <svg className="flex-shrink-0 mt-0.5 text-slate-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Coming soon — document management will be available in a future release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
