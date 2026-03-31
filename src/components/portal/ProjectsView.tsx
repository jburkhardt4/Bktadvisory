import { useState } from 'react';
import { useUserProjects } from '../../hooks/useUserProjects';
import type { Project, ProjectStatus } from './portalData';
import { ProjectStatusBadge } from './StatusBadge';
import { ChevronRightIcon, InboxIcon } from './PortalIcons';
import {
  PORTAL_TAB_BAR_CLASS,
  PORTAL_TAB_BUTTON_ACTIVE_CLASS,
  PORTAL_TAB_BUTTON_BASE_CLASS,
  PORTAL_TAB_BUTTON_INACTIVE_CLASS,
} from './portalBranding';

type Tab = 'active' | 'awaiting' | 'blocked' | 'completed';

const TAB_FILTERS: Record<Tab, ProjectStatus[]> = {
  active: ['intake', 'discovery', 'scoping', 'design_in_progress', 'build_in_progress', 'uat'],
  awaiting: ['awaiting_client'],
  blocked: ['blocked'],
  completed: ['completed', 'archived'],
};

function mapToProject(row: any): Project {
  const milestones = (row.milestones ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    date: m.target_date,
    completed: m.completed,
    description: m.description ?? '',
  }));
  const completedCount = milestones.filter((m: any) => m.completed).length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    startDate: row.created_at,
    estimatedEnd: row.target_milestone ?? row.created_at,
    progress,
    quoteRef: '',
    description: '',
    milestones,
    owner: row.owner,
    company: row.company_name,
    targetMilestone: row.target_milestone,
    projectActivity: (row.activity_events ?? []).map((e: any) => ({
      id: e.id,
      type: e.type,
      title: e.description,
      description: e.description,
      timestamp: e.created_at,
      user: e.actor,
    })),
  };
}

export function ProjectsView({ onSelectProject }: { onSelectProject: (id: string) => void }) {
  const { projects: rawProjects, loading } = useUserProjects();
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const allProjects = rawProjects.map(mapToProject);
  const filtered = allProjects.filter(p => TAB_FILTERS[activeTab].includes(p.status));
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: allProjects.filter(p => TAB_FILTERS.active.includes(p.status)).length },
    { key: 'awaiting', label: 'Awaiting Client', count: allProjects.filter(p => TAB_FILTERS.awaiting.includes(p.status)).length },
    { key: 'blocked', label: 'Blocked', count: allProjects.filter(p => TAB_FILTERS.blocked.includes(p.status)).length },
    { key: 'completed', label: 'Completed', count: allProjects.filter(p => TAB_FILTERS.completed.includes(p.status)).length },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse space-y-3">
          <div className="mx-auto h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mx-auto h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">All Projects</h3>
      </div>

      {/* Sub-tabs */}
      <div className={PORTAL_TAB_BAR_CLASS}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`${PORTAL_TAB_BUTTON_BASE_CLASS} ${
              activeTab === t.key ? PORTAL_TAB_BUTTON_ACTIVE_CLASS : PORTAL_TAB_BUTTON_INACTIVE_CLASS
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <InboxIcon size={24} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">No projects in this category</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                {/* Progress bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-medium text-slate-600 dark:text-slate-300">{p.progress}%</span>
                </div>
              </div>
              <span className="text-slate-400 dark:text-slate-500">
                <ChevronRightIcon size={16} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
