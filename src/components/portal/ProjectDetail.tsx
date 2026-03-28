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
  UploadIcon, PaperclipIcon, MessageSquareIcon,
  ZapIcon, SendIcon, UnlockIcon, CalendarCheckIcon,
  ShieldIcon, AlertCircleIcon, SearchIcon, PenIcon, PlayIcon, ArchiveIcon,
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Lifecycle Progress</h3>
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
                    : 'bg-slate-50 border-slate-300 text-slate-400 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-500'
                }`}>
                  {state === 'completed' ? (
                    <CheckCircleIcon size={16} />
                  ) : (
                    <span className="text-[10px] font-bold">{step.shortLabel}</span>
                  )}
                </div>
                <span className={`mt-2 text-[11px] font-medium whitespace-nowrap ${
                  state === 'completed' ? 'text-emerald-600' :
                  state === 'current' ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-1 mt-[-20px] ${
                  state === 'completed' ? 'bg-emerald-300' : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper - compact */}
      <div className="md:hidden">
        <div className="flex items-center gap-1">
          {LIFECYCLE_STEPS.map((step) => {
            const state = getStepState(step.key, effectiveStatus);
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className={`w-full h-2 rounded-full ${
                  state === 'completed' ? 'bg-emerald-400' :
                  state === 'current'
                    ? isOffRail && status === 'blocked' ? 'bg-red-400'
                    : isOffRail && status === 'awaiting_client' ? 'bg-orange-400'
                    : 'bg-blue-400'
                  : 'bg-slate-200 dark:bg-slate-800'
                }`} />
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Intake</span>
          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">
            {PROJECT_STATUS_CONFIG[status].label}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Completed</span>
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
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors cursor-pointer group hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="mb-4 h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                {i < 6 && <div className="mx-1 h-[2px] flex-1 bg-slate-200 dark:bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="mb-4 h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-950" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="mb-4 h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-950" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors cursor-pointer group hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeftIcon size={16} />
          <span className="group-hover:underline">Back to Dashboard</span>
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="text-slate-400 dark:text-slate-500">
            <AlertCircleIcon size={32} />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">Unable to load project</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error ?? 'Project not found'}</p>
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
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors cursor-pointer group hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
          <ArrowLeftIcon size={16} />
          <span className="group-hover:underline">Back to Dashboard</span>
        </button>
        <ActionDropdown
          label="Actions"
          userRole={role}
          context="project"
          onAction={setActiveModal}
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
              <span className="text-slate-600 dark:text-slate-500">· Lead</span>
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
            <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/60 dark:bg-slate-900 dark:shadow-black/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangleIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs uppercase tracking-wider font-bold text-red-600">Blocked</span>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">This project is currently blocked</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Check the activity timeline for details.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircleIcon size={24} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">No Blockers</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Project is proceeding smoothly.</p>
            </div>
          )}
        </div>

        {/* Right Column: Overall Progress */}
        <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <div className="absolute top-4 right-4"><EditButton /></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Overall Progress</h3>
            <span className="mr-6 text-xl font-bold text-slate-900 dark:text-slate-50">{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{formatDate(project.created_at)}</span>
            <span>{formatDate(project.updated_at)}</span>
          </div>
          
          {/* Progress details */}
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Completed Milestones</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">{completedMilestones} / {totalMilestones}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Current Phase</span>
              <span className="font-semibold text-slate-900 dark:text-slate-50">{PROJECT_STATUS_CONFIG[project.status].label}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Started</span>
              <span className="text-slate-900 dark:text-slate-100">{formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left column: Activity (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Activity Timeline */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Activity Timeline</h3>
                <div className="flex items-center gap-1">
                  {(['all', 'milestones', 'blockers'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        activityFilter === f
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
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
                  <p className="text-sm text-slate-500 dark:text-slate-400">No activity matching this filter.</p>
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
                          {i < filteredActivities.length - 1 && <div className="my-1 w-px flex-1 bg-slate-200 dark:bg-slate-800" />}
                        </div>
                        <div className="pb-6 pt-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatEventTitle(event.type)}</p>
                            <span className="whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">{formatDate(event.created_at)} · {formatTime(event.created_at)}</span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
                          {event.actor && (
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="text-slate-600 dark:text-slate-200">{event.actor}</span>
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
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Milestones</h3>
              <EditButton />
            </div>
            {milestones.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">No milestones yet</p>
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
                          : 'bg-slate-50 border-slate-300 text-slate-400 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-500'
                      }`}>
                        {m.completed ? <CheckCircleIcon size={12} /> : <ClockIcon size={12} />}
                      </div>
                      {i < milestones.length - 1 && <div className="my-1 w-px flex-1 bg-slate-200 dark:bg-slate-800" />}
                    </div>
                    <div className="pb-4 pt-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs font-semibold ${m.completed ? 'text-emerald-600' : m.title === project.target_milestone ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-300'}`}>{m.title}</p>
                        {m.completed && <span className="text-[10px] text-emerald-600 font-medium">Done</span>}
                        {m.title === project.target_milestone && !m.completed && <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300">Current Target</span>}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{m.description}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">{formatDate(m.target_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Documents</h3>
            </div>
            <div className="py-10 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <PaperclipIcon size={20} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">No documents uploaded yet.</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Files will appear here as they're shared.</p>
            </div>
            {/* Upload placeholder */}
            <div className="px-4 pb-4 pt-2">
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-xs text-slate-600 transition-colors cursor-pointer hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100">
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
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Project Name</label>
              <input type="text" defaultValue={project.name} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-400" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
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
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">File</label>
              <div className="w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-300 py-8 text-center text-sm text-slate-500 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600">
                Click or drag to upload a file
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all">Upload</button>
            </div>
          </form>
        </PortalModal>
      )}
    </div>
  );
}
