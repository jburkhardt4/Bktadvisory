import { useState } from 'react';
import type { Project, ProjectStatus, ProjectActivityType } from './portalData';
import { PROJECT_STATUS_CONFIG } from './portalData';
import { ProjectStatusBadge } from './StatusBadge';
import {
  ArrowLeftIcon, CheckCircleIcon, ClockIcon, UserIcon, BuildingIcon,
  TargetIcon, AlertTriangleIcon, FileTextIcon, FolderIcon,
  KeyIcon, UploadIcon, PaperclipIcon, MessageSquareIcon,
  ZapIcon, SendIcon, UnlockIcon, CalendarCheckIcon,
  DownloadIcon, ExternalLinkIcon, ShieldIcon, AlertCircleIcon,
  LayersIcon, SearchIcon, PenIcon, PlayIcon, ArchiveIcon,
} from './PortalIcons';

/* \u2500\u2500\u2500 Lifecycle Stepper \u2500\u2500\u2500 */

const LIFECYCLE_STEPS: { key: ProjectStatus; label: string; shortLabel: string }[] = [
  { key: 'intake', label: 'Intake', shortLabel: 'INT' },
  { key: 'discovery', label: 'Discovery', shortLabel: 'DIS' },
  { key: 'scoping', label: 'Scoping', shortLabel: 'SCP' },
  { key: 'design_in_progress', label: 'Design', shortLabel: 'DES' },
  { key: 'build_in_progress', label: 'Build', shortLabel: 'BLD' },
  { key: 'uat', label: 'UAT', shortLabel: 'UAT' },
  { key: 'completed', label: 'Completed', shortLabel: 'DON' },
];

const OFF_RAIL_STATUSES: ProjectStatus[] = ['awaiting_client', 'blocked', 'archived'];

function getStepState(stepKey: ProjectStatus, currentStatus: ProjectStatus): 'completed' | 'current' | 'upcoming' {
  const currentIdx = LIFECYCLE_STEPS.findIndex(s => s.key === currentStatus);
  const stepIdx = LIFECYCLE_STEPS.findIndex(s => s.key === stepKey);
  if (currentStatus === 'completed' || currentStatus === 'archived') return 'completed';
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
}

function StatusStepper({ status }: { status: ProjectStatus }) {
  const isOffRail = OFF_RAIL_STATUSES.includes(status);
  const effectiveStatus = isOffRail ? 'build_in_progress' : status;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-50">Lifecycle Progress</h3>
        {isOffRail && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${PROJECT_STATUS_CONFIG[status].bg} ${PROJECT_STATUS_CONFIG[status].color}`}>
            {status === 'blocked' && <AlertTriangleIcon size={12} />}
            {status === 'awaiting_client' && <ClockIcon size={12} />}
            {status === 'archived' && <ArchiveIcon size={12} />}
            {PROJECT_STATUS_CONFIG[status].label}
          </span>
        )}
      </div>

      <div className="hidden md:flex items-center gap-0">
        {LIFECYCLE_STEPS.map((step, i) => {
          const state = getStepState(step.key, effectiveStatus);
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : state === 'current'
                    ? isOffRail && status === 'blocked'
                      ? 'bg-red-500/20 border-red-500 text-red-400 ring-4 ring-red-500/10'
                      : isOffRail && status === 'awaiting_client'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 ring-4 ring-orange-500/10'
                      : 'bg-blue-500/20 border-blue-500 text-blue-400 ring-4 ring-blue-500/10'
                    : 'bg-white/[0.03] border-white/[0.1] text-slate-600'
                }`}>
                  {state === 'completed' ? (
                    <CheckCircleIcon size={16} />
                  ) : (
                    <span className="text-[10px] font-bold">{step.shortLabel}</span>
                  )}
                </div>
                <span className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                  state === 'completed' ? 'text-emerald-400/70' :
                  state === 'current' ? 'text-slate-200' : 'text-slate-600'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-1 mt-[-20px] ${
                  state === 'completed' ? 'bg-emerald-500/40' : 'bg-white/[0.06]'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="md:hidden">
        <div className="flex items-center gap-1">
          {LIFECYCLE_STEPS.map((step) => {
            const state = getStepState(step.key, effectiveStatus);
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className={`w-full h-2 rounded-full ${
                  state === 'completed' ? 'bg-emerald-500/50' :
                  state === 'current'
                    ? isOffRail && status === 'blocked' ? 'bg-red-500/50'
                    : isOffRail && status === 'awaiting_client' ? 'bg-orange-500/50'
                    : 'bg-blue-500/50'
                  : 'bg-white/[0.06]'
                }`} />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-slate-500">Intake</span>
          <span className="text-[10px] text-slate-400 font-medium">
            {PROJECT_STATUS_CONFIG[status].label}
          </span>
          <span className="text-[10px] text-slate-500">Completed</span>
        </div>
      </div>
    </div>
  );
}

/* \u2500\u2500\u2500 Activity Timeline \u2500\u2500\u2500 */

const ACTIVITY_TYPE_CONFIG: Record<ProjectActivityType, { color: string; bg: string; icon: React.ReactNode }> = {
  quote_generated: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: <FileTextIcon size={13} /> },
  quote_sent: { color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', icon: <SendIcon size={13} /> },
  quote_accepted: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircleIcon size={13} /> },
  project_created: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: <FolderIcon size={13} /> },
  discovery_completed: { color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: <SearchIcon size={13} /> },
  scope_approved: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: <ShieldIcon size={13} /> },
  design_started: { color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', icon: <PenIcon size={13} /> },
  build_started: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: <ZapIcon size={13} /> },
  blocked: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: <AlertTriangleIcon size={13} /> },
  unblocked: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <UnlockIcon size={13} /> },
  uat_started: { color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', icon: <PlayIcon size={13} /> },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircleIcon size={13} /> },
  comment: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: <MessageSquareIcon size={13} /> },
  document_uploaded: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: <PaperclipIcon size={13} /> },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* \u2500\u2500\u2500 Client Action Card \u2500\u2500\u2500 */

function ClientActionCard({ action }: { action: import('./portalData').ClientAction }) {
  const typeConfig = {
    awaiting_approval: { icon: <ShieldIcon size={18} />, accent: 'from-amber-500 to-orange-500', label: 'Awaiting Approval', border: 'border-amber-500/20', iconBg: 'bg-amber-500/10 text-amber-400' },
    awaiting_content: { icon: <UploadIcon size={18} />, accent: 'from-cyan-500 to-blue-500', label: 'Awaiting Content', border: 'border-cyan-500/20', iconBg: 'bg-cyan-500/10 text-cyan-400' },
    awaiting_credentials: { icon: <KeyIcon size={18} />, accent: 'from-red-500 to-rose-500', label: 'Awaiting Credentials', border: 'border-red-500/20', iconBg: 'bg-red-500/10 text-red-400' },
  };
  const cfg = typeConfig[action.type];
  const priorityColors = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    low: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  };

  return (
    <div className={`bg-white/[0.03] border ${cfg.border} rounded-xl p-4 hover:bg-white/[0.05] transition-colors`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r ${cfg.accent} bg-clip-text text-transparent`}>
              {cfg.label}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${priorityColors[action.priority]}`}>
              {action.priority}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-200">{action.title}</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
          {action.dueDate && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <CalendarCheckIcon size={12} />
              <span>Due {formatDate(action.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* \u2500\u2500\u2500 Document Row \u2500\u2500\u2500 */

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: 'text-red-400 bg-red-400/10',
  docx: 'text-blue-400 bg-blue-400/10',
  xlsx: 'text-emerald-400 bg-emerald-400/10',
  pptx: 'text-orange-400 bg-orange-400/10',
  figma: 'text-purple-400 bg-purple-400/10',
  link: 'text-cyan-400 bg-cyan-400/10',
};

function DocumentRow({ doc }: { doc: import('./portalData').ProjectDocument }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors rounded-lg group">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${FILE_TYPE_COLORS[doc.type] || 'text-slate-400 bg-slate-400/10'}`}>
        {doc.type === 'figma' ? <LayersIcon size={16} /> :
         doc.type === 'link' ? <ExternalLinkIcon size={16} /> :
         <FileTextIcon size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{doc.name}</p>
        <p className="text-xs text-slate-500">
          {doc.uploadedBy} \u00b7 {formatDate(doc.uploadedAt)}
          {doc.size && <span> \u00b7 {doc.size}</span>}
        </p>
      </div>
      <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
        <DownloadIcon size={15} />
      </button>
    </div>
  );
}

/* \u2500\u2500\u2500 Main Component \u2500\u2500\u2500 */

export function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const [activityFilter, setActivityFilter] = useState<'all' | 'milestones' | 'blockers'>('all');
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;
  const activities = project.projectActivity || [];
  const clientActions = project.clientActions || [];
  const blockers = project.blockers || [];
  const documents = project.documents || [];

  const filteredActivities = activities.filter(a => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'blockers') return a.type === 'blocked' || a.type === 'unblocked';
    if (activityFilter === 'milestones') return ['discovery_completed', 'scope_approved', 'design_started', 'build_started', 'uat_started', 'completed'].includes(a.type);
    return true;
  });

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group">
        <ArrowLeftIcon size={16} />
        <span className="group-hover:underline">Back to Dashboard</span>
      </button>

      <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{project.id}</span>
              <ProjectStatusBadge status={project.status} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-50 tracking-tight">{project.name}</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">{project.description}</p>
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-50">{project.progress}%</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-50">{completedMilestones}<span className="text-slate-600">/{totalMilestones}</span></p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Milestones</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/[0.06]">
          {project.company && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BuildingIcon size={14} />
              <span>{project.company}</span>
            </div>
          )}
          {project.owner && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <UserIcon size={14} />
              <span className="text-slate-300">{project.owner}</span>
              <span className="text-slate-600">\u00b7 Lead</span>
            </div>
          )}
          {project.targetMilestone && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TargetIcon size={14} />
              <span>Target: <span className="text-slate-300">{project.targetMilestone}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarCheckIcon size={14} />
            <span>Est. {formatDate(project.estimatedEnd)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-slate-600">Quote:</span>
            <span className="font-mono text-slate-400">{project.quoteRef}</span>
          </div>
        </div>
      </div>

      <StatusStepper status={project.status} />

      {blockers.length > 0 && (
        <div className="space-y-3">
          {blockers.map(b => (
            <div key={b.id} className={`rounded-xl p-4 border flex items-start gap-3 ${
              b.severity === 'critical'
                ? 'bg-red-500/[0.06] border-red-500/20'
                : 'bg-amber-500/[0.06] border-amber-500/20'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                b.severity === 'critical' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
              }`}>
                <AlertTriangleIcon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${
                    b.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {b.severity === 'critical' ? 'Critical Blocker' : 'Warning'}
                  </span>
                  <span className="text-[10px] text-slate-600">\u00b7 {formatDate(b.createdAt)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-200 mt-1">{b.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.description}</p>
                <p className="text-xs text-slate-500 mt-1.5">Owner: <span className="text-slate-400">{b.owner}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {clientActions.length > 0 && (
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-50">Action Required</h3>
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center justify-center">{clientActions.length}</span>
                </div>
                <span className="text-xs text-slate-500">Items awaiting your input</span>
              </div>
              <div className="p-4 space-y-3">
                {clientActions.map(a => <ClientActionCard key={a.id} action={a} />)}
              </div>
            </div>
          )}

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-slate-50">Activity Timeline</h3>
                <div className="flex items-center gap-1">
                  {(['all', 'milestones', 'blockers'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        activityFilter === f
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              {filteredActivities.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500">No activity matching this filter.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredActivities.map((event, i) => {
                    const cfg = ACTIVITY_TYPE_CONFIG[event.type];
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}
                          </div>
                          {i < filteredActivities.length - 1 && <div className="w-px flex-1 bg-white/[0.06] my-1" />}
                        </div>
                        <div className="pb-6 pt-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-200">{event.title}</p>
                            <span className="text-[11px] text-slate-600 whitespace-nowrap">{formatDate(event.timestamp)} \u00b7 {formatTime(event.timestamp)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
                          <p className="text-[11px] text-slate-600 mt-1">
                            <span className="text-slate-500">{event.user}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-50">Overall Progress</h3>
              <span className="text-sm font-bold text-slate-200">{project.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  project.status === 'blocked'
                    ? 'bg-gradient-to-r from-red-500 to-red-400'
                    : project.status === 'awaiting_client'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                    : project.status === 'completed'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600">
              <span>{formatDate(project.startDate)}</span>
              <span>{formatDate(project.estimatedEnd)}</span>
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-slate-50">Milestones</h3>
            </div>
            <div className="p-4 space-y-0">
              {project.milestones.map((m, i) => (
                <div key={m.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      m.completed
                        ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                        : m.title === project.targetMilestone
                        ? 'bg-blue-400/10 border-blue-400/20 text-blue-400 ring-2 ring-blue-400/10'
                        : 'bg-white/[0.03] border-white/[0.08] text-slate-600'
                    }`}>
                      {m.completed ? <CheckCircleIcon size={12} /> : <ClockIcon size={12} />}
                    </div>
                    {i < project.milestones.length - 1 && <div className="w-px flex-1 bg-white/[0.06] my-1" />}
                  </div>
                  <div className="pb-4 pt-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-xs font-semibold ${m.completed ? 'text-slate-300' : m.title === project.targetMilestone ? 'text-blue-300' : 'text-slate-500'}`}>{m.title}</p>
                      {m.completed && <span className="text-[10px] text-emerald-500 font-medium">Done</span>}
                      {m.title === project.targetMilestone && !m.completed && <span className="text-[10px] text-blue-400 font-medium">Current Target</span>}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{m.description}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(m.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-50">Documents</h3>
              {documents.length > 0 && (
                <span className="text-xs text-slate-500">{documents.length} files</span>
              )}
            </div>
            {documents.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-800 flex items-center justify-center text-slate-600">
                  <PaperclipIcon size={20} />
                </div>
                <p className="text-xs text-slate-500">No documents uploaded yet.</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Files will appear here as they're shared.</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {documents.map(doc => <DocumentRow key={doc.id} doc={doc} />)}
              </div>
            )}
            <div className="px-4 pb-4 pt-2">
              <button className="w-full py-3 border-2 border-dashed border-white/[0.08] rounded-xl text-xs text-slate-500 hover:text-slate-400 hover:border-white/[0.12] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <UploadIcon size={14} />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
