import { useState } from 'react';
import { mockProjects } from '../../mocks/portalData';
import type { ProjectRecord, ProjectStatus } from '../../types/portal';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; classes: string }> = {
  intake:             { label: 'Intake',             classes: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  discovery:          { label: 'Discovery',          classes: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  scoping:            { label: 'Scoping',            classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  design_in_progress: { label: 'Design',             classes: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
  build_in_progress:  { label: 'Build',              classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  awaiting_client:    { label: 'Awaiting Client',    classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  blocked:            { label: 'Blocked',            classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  uat:                { label: 'UAT',                classes: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
  completed:          { label: 'Completed',          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  archived:           { label: 'Archived',           classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

const ACTIVE_STATUSES: ProjectStatus[] = ['intake', 'discovery', 'scoping', 'design_in_progress', 'build_in_progress'];
const AWAITING_STATUSES: ProjectStatus[] = ['awaiting_client'];
const BLOCKED_STATUSES: ProjectStatus[] = ['blocked'];
const DONE_STATUSES: ProjectStatus[] = ['completed', 'archived', 'uat'];

const TABS = [
  { id: 'active',    label: 'Active',                statuses: ACTIVE_STATUSES },
  { id: 'awaiting',  label: 'Awaiting Client',        statuses: AWAITING_STATUSES },
  { id: 'blocked',   label: 'Blocked',                statuses: BLOCKED_STATUSES },
  { id: 'done',      label: 'Completed / Archived',   statuses: DONE_STATUSES },
] as const;

type TabId = (typeof TABS)[number]['id'];

function StatusChip({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}

function ProjectCard({ project }: { project: ProjectRecord }) {
  return (
    <div className="p-4 border border-slate-700/40 rounded-lg bg-slate-900/40 space-y-3 hover:border-slate-600/60 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold leading-snug">{project.name}</div>
          <div className="text-slate-400 text-xs mt-0.5">{project.companyName}</div>
        </div>
        <StatusChip status={project.status} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-slate-500 mb-0.5">Owner</div>
          <div className="text-slate-300">{project.owner}</div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5">Last Updated</div>
          <div className="text-slate-300">{formatDate(project.updatedAt)}</div>
        </div>
        <div className="col-span-2">
          <div className="text-slate-500 mb-0.5">Target Milestone</div>
          <div className="text-slate-300">{project.targetMilestone}</div>
        </div>
      </div>
    </div>
  );
}

export function ProjectSegmentedView() {
  const [activeTab, setActiveTab] = useState<TabId>('active');

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const filtered = mockProjects.filter((p) =>
    (currentTab.statuses as readonly ProjectStatus[]).includes(p.status)
  );

  const countFor = (tab: (typeof TABS)[number]) =>
    mockProjects.filter((p) => (tab.statuses as readonly ProjectStatus[]).includes(p.status)).length;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg border border-slate-700/50 mb-4">
        {TABS.map((tab) => {
          const count = countFor(tab);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40',
              ].join(' ')}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-semibold ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-700 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-slate-500 text-sm border border-slate-700/30 rounded-xl">
          No projects in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
