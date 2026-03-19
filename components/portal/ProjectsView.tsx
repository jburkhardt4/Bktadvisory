import { useState } from 'react';
import { mockProjects } from './portalData';
import type { Project, ProjectStatus } from './portalData';
import { ProjectStatusBadge } from './StatusBadge';
import { ChevronRightIcon, InboxIcon } from './PortalIcons';

type Tab = 'active' | 'awaiting' | 'blocked' | 'completed';

const TAB_FILTERS: Record<Tab, ProjectStatus[]> = {
  active: ['intake', 'discovery', 'scoping', 'design_in_progress', 'build_in_progress', 'uat'],
  awaiting: ['awaiting_client'],
  blocked: ['blocked'],
  completed: ['completed', 'archived'],
};

export function ProjectsView({ onSelectProject }: { onSelectProject: (p: Project) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('active');

  const filtered = mockProjects.filter(p => TAB_FILTERS[activeTab].includes(p.status));
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: mockProjects.filter(p => TAB_FILTERS.active.includes(p.status)).length },
    { key: 'awaiting', label: 'Awaiting Client', count: mockProjects.filter(p => TAB_FILTERS.awaiting.includes(p.status)).length },
    { key: 'blocked', label: 'Blocked', count: mockProjects.filter(p => TAB_FILTERS.blocked.includes(p.status)).length },
    { key: 'completed', label: 'Completed', count: mockProjects.filter(p => TAB_FILTERS.completed.includes(p.status)).length },
  ];

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-base font-semibold text-slate-50">Projects</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/[0.06] overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.05] text-slate-500'
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
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
            <InboxIcon size={24} />
          </div>
          <p className="text-sm text-slate-500">No projects in this category</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-200">{p.name}</span>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{p.description}</p>
                {/* Progress bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium w-8 text-right">{p.progress}%</span>
                </div>
              </div>
              <ChevronRightIcon size={16} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
