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
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">All Projects</h3>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-slate-200 overflow-x-auto bg-slate-50">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.key
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
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
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <InboxIcon size={24} />
          </div>
          <p className="text-sm text-slate-500">No projects in this category</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{p.description}</p>
                {/* Progress bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 font-medium w-8 text-right">{p.progress}%</span>
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