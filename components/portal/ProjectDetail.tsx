import type { Project } from './portalData';
import { PROJECT_STATUS_CONFIG } from './portalData';
import { ProjectStatusBadge } from './StatusBadge';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from './PortalIcons';

export function ProjectDetail({ project, onBack }: { project: Project; onBack: () => void }) {
  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const totalMilestones = project.milestones.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <ArrowLeftIcon size={20} />
        </button>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Project Detail</p>
          <h2 className="text-xl font-bold text-slate-50 mt-0.5">{project.name}</h2>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Status', value: <ProjectStatusBadge status={project.status} /> },
          { label: 'Progress', value: <span className="text-xl font-bold text-slate-50">{project.progress}%</span> },
          { label: 'Milestones', value: <span className="text-xl font-bold text-slate-50">{completedMilestones}/{totalMilestones}</span> },
          { label: 'Est. Completion', value: <span className="text-sm font-semibold text-slate-200">{new Date(project.estimatedEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> },
        ].map((card, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">{card.label}</p>
            {card.value}
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-slate-50 mb-2">Overview</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span>Quote: <span className="text-slate-400 font-mono">{project.quoteRef}</span></span>
          <span>Started: {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-slate-50 mb-4">Progress Rail</h3>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${project.progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">{project.progress}% complete</p>
      </div>

      {/* Milestone timeline */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-slate-50 mb-5">Milestones</h3>
        <div className="space-y-0">
          {project.milestones.map((m, i) => (
            <div key={m.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  m.completed
                    ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                    : 'bg-slate-700/40 border-slate-600/30 text-slate-500'
                }`}>
                  {m.completed ? <CheckCircleIcon size={14} /> : <ClockIcon size={14} />}
                </div>
                {i < project.milestones.length - 1 && <div className="w-px flex-1 bg-white/[0.06] my-1" />}
              </div>
              <div className="pb-5 pt-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${m.completed ? 'text-slate-200' : 'text-slate-400'}`}>{m.title}</p>
                  {m.completed && <span className="text-xs text-emerald-500 font-medium">Completed</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                <p className="text-xs text-slate-600 mt-1">{new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
