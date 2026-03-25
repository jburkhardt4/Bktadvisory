import { useState, useEffect } from 'react';
import type { ProjectStatus } from './portalData';
import { PROJECT_STATUS_CONFIG } from './portalData';
import { ProjectStatusBadge } from './StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/client';
import type { Database } from '../../types/supabase';
import {
  ArrowLeftIcon, CheckCircleIcon, ClockIcon, UserIcon, BuildingIcon,
  TargetIcon, AlertTriangleIcon, FileTextIcon, FolderIcon,
  KeyIcon, UploadIcon, PaperclipIcon, MessageSquareIcon,
  ZapIcon, SendIcon, UnlockIcon, CalendarCheckIcon,
  DownloadIcon, ExternalLinkIcon, ShieldIcon, AlertCircleIcon,
  LayersIcon, SearchIcon, PenIcon, PlayIcon, ArchiveIcon,
} from './PortalIcons';

import { ActionDropdown, EditButton } from './ActionDropdown';
import { PortalModal } from './PortalModal';
import { AddActivityForm } from './forms/AddActivityForm';
import { AddMilestoneForm } from './forms/AddMilestoneForm';

type ActivityEventType = Database['public']['Enums']['activity_event_type'];

interface DbProject {
  id: string;
  name: string;
  company_name: string;
  status: ProjectStatus;
  owner: string;
  target_milestone: string;
  created_at: string;
  updated_at: string;
}

interface DbMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface DbActivity {
  id: string;
  type: ActivityEventType;
  client_id: string | null;
  record_id: string;
  description: string;
  actor: string | null;
  created_at: string;
}

/* ─── Lifecycle Stepper ─── */

const LIFECYCLE_STEPS: { key: ProjectStatus; label: string; shortLabel: string }[] = [
  { key: 'intake', label: 'Intake', shortLabel: 'INT' },
  { key: 'discovery', label: 'Discovery', shortLabel: 'DIS' },
  { key: 'scoping', label: 'Scoping', shortLabel: 'SCP' },
  { key: 'design_in_progress', label: 'Design', shortLabel: 'DES' },
  { key: 'build_in_progress', label: 'Build', shortLabel: 'BLD' },
  { key: 'uat', label: 'UAT', shortLabel: 'UAT' },
  { key: 'completed', label: 'Completed', shortLabel: 'DON' },
];

// Statuses that sit "off-rail" (overlay indicators, not linear steps)
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
  // For off-rail statuses, figure out the "real" position based on project progress
  const effectiveStatus = isOffRail ? 'build_in_progress' : status; // default assumption

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Lifecycle Progress</h3>
        {isOffRail && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${PROJECT_STATUS_CONFIG[status].bg} ${PROJECT_STATUS_CONFIG[status].color}`}>
            {status === 'blocked' && <AlertTriangleIcon size={12} />}
            {status === 'awaiting_client' && <ClockIcon size={12} />}
            {status === 'archived' && <ArchiveIcon size={12} />}
            {PROJECT_STATUS_CONFIG[status].label}
          </span>
        )}
      </div>

      {/* Desktop stepper */}
      <div className="hidden md:flex items-center gap-0">
        {LIFECYCLE_STEPS.map((step, i) => {
          const state = getStepState(step.key, effectiveStatus);
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                    : state === 'current'
                    ? isOffRail && status === 'blocked'
                      ? 'bg-red-50 border-red-500 text-red-600 ring-4 ring-red-100'
                      : isOffRail && status === 'awaiting_client'
                      ? 'bg-orange-50 border-orange-500 text-orange-600 ring-4 ring-orange-100'
                      : 'bg-blue-50 border-blue-500 text-blue-600 ring-4 ring-blue-100'
                    : 'bg-slate-50 border-slate-300 text-slate-400'
                }`}>
                  {state === 'completed' ? (
                    <CheckCircleIcon size={16} />
                  ) : (
                    <span className="text-[10px] font-bold">{step.shortLabel}</span>
                  )}
                </div>
                <span className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                  state === 'completed' ? 'text-emerald-600' :
                  state === 'current' ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-1 mt-[-20px] ${
                  state === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper - compact */}
      <div className="md:hidden">
        <div className="flex items-center gap-1">
          {LIFECYCLE_STEPS.map((step, i) => {
            const state = getStepState(step.key, effectiveStatus);
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className={`w-full h-2 rounded-full ${
                  state === 'completed' ? 'bg-emerald-400' :
                  state === 'current'
                    ? isOffRail && status === 'blocked' ? 'bg-red-400'
                    : isOffRail && status === 'awaiting_client' ? 'bg-orange-400'
                    : 'bg-blue-400'
                  : 'bg-slate-200'
                }`} />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-slate-500">Intake</span>
          <span className="text-[10px] text-slate-700 font-medium">
            {PROJECT_STATUS_CONFIG[status].label}
          </span>
          <span className="text-[10px] text-slate-500">Completed</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Activity Timeline ─── */

const ACTIVITY_TYPE_CONFIG: Partial<Record<ActivityEventType, { color: string; bg: string; icon: React.ReactNode }>> = {
  quote_generated: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: <FileTextIcon size={13} /> },
  quote_sent: { color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', icon: <SendIcon size={13} /> },
  quote_revised: { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', icon: <FileTextIcon size={13} /> },
  quote_accepted: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircleIcon size={13} /> },
  project_created: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: <FolderIcon size={13} /> },
  discovery_completed: { color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', icon: <SearchIcon size={13} /> },
  scope_approved: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: <ShieldIcon size={13} /> },
  design_started: { color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20', icon: <PenIcon size={13} /> },
  build_started: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: <ZapIcon size={13} /> },
  client_feedback_requested: { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', icon: <MessageSquareIcon size={13} /> },
  client_feedback_received: { color: 'text-teal-400', bg: 'bg-teal-400/10 border-teal-400/20', icon: <MessageSquareIcon size={13} /> },
  blocked: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: <AlertTriangleIcon size={13} /> },
  unblocked: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <UnlockIcon size={13} /> },
  uat_started: { color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', icon: <PlayIcon size={13} /> },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircleIcon size={13} /> },
  archived: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: <ArchiveIcon size={13} /> },
};

const DEFAULT_ACTIVITY_STYLE = { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: <AlertCircleIcon size={13} /> };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatEventTitle(type: ActivityEventType): string {
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ─── Main Component ─── */

export function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const { role } = useAuth();
  const [project, setProject] = useState<DbProject | null>(null);
  const [milestones, setMilestones] = useState<DbMilestone[]>([]);
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'milestones' | 'blockers'>('all');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const [projRes, msRes, actRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('milestones').select('*').eq('project_id', projectId).order('target_date', { ascending: true }),
        supabase.from('activity_events').select('*').eq('record_id', projectId).order('created_at', { ascending: false }),
      ]);

      if (projRes.error) {
        setError(projRes.error.message);
        setLoading(false);
        return;
      }

      setProject(projRes.data as DbProject);
      setMilestones((msRes.data as DbMilestone[]) ?? []);
      setActivities((actRes.data as DbActivity[]) ?? []);
      setLoading(false);
    }

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group">
            <ArrowLeftIcon size={16} />
            <span className="group-hover:underline">Back to Dashboard</span>
          </button>
        </div>
        {/* Hero skeleton */}
        <div className="bg-gradient-to-br from-[#0F172B] via-slate-800 to-purple-950 rounded-2xl p-6 lg:p-8 shadow-lg border border-slate-700/50 animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded mb-3" />
          <div className="h-8 w-2/3 bg-white/10 rounded mb-2" />
          <div className="h-4 w-1/2 bg-white/5 rounded" />
          <div className="flex gap-4 mt-6 pt-5 border-t border-white/[0.08]">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
        </div>
        {/* Stepper skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-pulse">
          <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="w-9 h-9 rounded-full bg-slate-200" />
                {i < 6 && <div className="flex-1 h-[2px] bg-slate-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
            <div className="h-3 w-full bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group">
          <ArrowLeftIcon size={16} />
          <span className="group-hover:underline">Back to Dashboard</span>
        </button>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
          <AlertCircleIcon size={32} />
          <h3 className="text-base font-semibold text-slate-900 mt-3">Unable to load project</h3>
          <p className="text-sm text-slate-500 mt-1">{error ?? 'Project not found'}</p>
        </div>
      </div>
    );
  }

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const filteredActivities = activities.filter(a => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'blockers') return a.type === 'blocked' || a.type === 'unblocked';
    if (activityFilter === 'milestones') return ['discovery_completed', 'scope_approved', 'design_started', 'build_started', 'uat_started', 'completed'].includes(a.type);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Back Button ── */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group">
          <ArrowLeftIcon size={16} />
          <span className="group-hover:underline">Back to Dashboard</span>
        </button>
        <ActionDropdown
          label="Actions"
          userRole={role}
          items={[
            { label: 'Update Project', icon: <FolderIcon size={15} />, adminOnly: true, onClick: () => setActiveModal('update-project') },
            { label: 'Add Milestone', icon: <TargetIcon size={15} />, adminOnly: true, onClick: () => setActiveModal('add-milestone') },
            { label: 'Add Activity', icon: <ZapIcon size={15} />, onClick: () => setActiveModal('add-activity') },
            { label: 'Upload Document', icon: <UploadIcon size={15} />, onClick: () => setActiveModal('upload-document') },
          ]}
        />
      </div>

      {/* ── Project Header (Dark Gradient Hero) ── */}
      <div className="bg-gradient-to-br from-[#0F172B] via-slate-800 to-purple-950 rounded-2xl p-6 lg:p-8 shadow-lg border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">{project.id.slice(0, 8)}</span>
              <ProjectStatusBadge status={project.status} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-50 tracking-tight">{project.name}</h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/[0.08]">
          {project.company_name && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BuildingIcon size={14} />
              <span>{project.company_name}</span>
            </div>
          )}
          {project.owner && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <UserIcon size={14} />
              <span className="text-slate-300">{project.owner}</span>
              <span className="text-slate-600">· Lead</span>
            </div>
          )}
          {project.target_milestone && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TargetIcon size={14} />
              <span>Target: <span className="text-slate-300">{project.target_milestone}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarCheckIcon size={14} />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>

      {/* ── Lifecycle Progress Stepper ── */}
      <StatusStepper status={project.status} />

      {/* ── 2-Column Grid: Status (Left) + Progress (Right) ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column: Status */}
        <div className="lg:col-span-3 space-y-3">
          {project.status === 'blocked' ? (
            <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-600">
                <AlertTriangleIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs uppercase tracking-wider font-bold text-red-600">Blocked</span>
                <p className="text-base font-semibold text-slate-900 mt-1">This project is currently blocked</p>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">Check the activity timeline for details.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircleIcon size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No Blockers</h3>
              <p className="text-sm text-slate-600 mt-1">Project is proceeding smoothly.</p>
            </div>
          )}
        </div>

        {/* Right Column: Overall Progress */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
          <div className="absolute top-4 right-4"><EditButton /></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900">Overall Progress</h3>
            <span className="text-xl font-bold text-slate-900 mr-6">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                project.status === 'blocked'
                  ? 'bg-gradient-to-r from-red-500 to-red-400'
                  : project.status === 'awaiting_client'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                  : project.status === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>{formatDate(project.created_at)}</span>
            <span>{formatDate(project.updated_at)}</span>
          </div>
          
          {/* Progress details */}
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Completed Milestones</span>
              <span className="font-semibold text-slate-900">{completedMilestones} / {totalMilestones}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Current Phase</span>
              <span className="font-semibold text-slate-900">{PROJECT_STATUS_CONFIG[project.status].label}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Started</span>
              <span className="text-slate-900">{formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left column: Activity (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Activity Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-slate-900">Activity Timeline</h3>
                <div className="flex items-center gap-1">
                  {(['all', 'milestones', 'blockers'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        activityFilter === f
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    const cfg = ACTIVITY_TYPE_CONFIG[event.type] ?? DEFAULT_ACTIVITY_STYLE;
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.color}`}>
                            {cfg.icon}
                          </div>
                          {i < filteredActivities.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                        </div>
                        <div className="pb-6 pt-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-900">{formatEventTitle(event.type)}</p>
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">{formatDate(event.created_at)} · {formatTime(event.created_at)}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{event.description}</p>
                          {event.actor && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              <span className="text-slate-600">{event.actor}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Milestones + Documents (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Milestones */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Milestones</h3>
              <EditButton />
            </div>
            {milestones.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500">No milestones yet</p>
              </div>
            ) : (
              <div className="p-4 space-y-0">
                {milestones.map((m, i) => (
                  <div key={m.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        m.completed
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                          : m.title === project.target_milestone
                          ? 'bg-blue-50 border-blue-500 text-blue-600 ring-2 ring-blue-100'
                          : 'bg-slate-50 border-slate-300 text-slate-400'
                      }`}>
                        {m.completed ? <CheckCircleIcon size={12} /> : <ClockIcon size={12} />}
                      </div>
                      {i < milestones.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                    </div>
                    <div className="pb-4 pt-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs font-semibold ${m.completed ? 'text-emerald-600' : m.title === project.target_milestone ? 'text-blue-700' : 'text-slate-500'}`}>{m.title}</p>
                        {m.completed && <span className="text-[10px] text-emerald-600 font-medium">Done</span>}
                        {m.title === project.target_milestone && !m.completed && <span className="text-[10px] text-blue-600 font-medium">Current Target</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(m.target_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Documents</h3>
            </div>
            <div className="py-10 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                <PaperclipIcon size={20} />
              </div>
              <p className="text-xs text-slate-600">No documents uploaded yet.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Files will appear here as they're shared.</p>
            </div>
            {/* Upload placeholder */}
            <div className="px-4 pb-4 pt-2">
              <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <UploadIcon size={14} />
                Upload Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {activeModal === 'update-project' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Update Project">
          <form onSubmit={e => { e.preventDefault(); setActiveModal(null); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input type="text" defaultValue={project.name} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all">Save Changes</button>
            </div>
          </form>
        </PortalModal>
      )}
      {activeModal === 'add-milestone' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Add Milestone">
          <AddMilestoneForm onClose={() => setActiveModal(null)} projectId={project.id} />
        </PortalModal>
      )}
      {activeModal === 'add-activity' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Add Activity">
          <AddActivityForm onClose={() => setActiveModal(null)} projectId={project.id} />
        </PortalModal>
      )}
      {activeModal === 'upload-document' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Upload Document">
          <form onSubmit={e => { e.preventDefault(); setActiveModal(null); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
              <div className="w-full py-8 border-2 border-dashed border-slate-300 rounded-lg text-center text-sm text-slate-500 hover:border-slate-400 transition-colors cursor-pointer">
                Click or drag to upload a file
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all">Upload</button>
            </div>
          </form>
        </PortalModal>
      )}
    </div>
  );
}