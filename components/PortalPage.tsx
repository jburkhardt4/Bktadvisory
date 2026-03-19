import { useState } from 'react';
import { Link } from 'react-router';
import type { Project } from './portal/portalData';
import { UserProfile } from './portal/UserProfile';
import { QuotesTable } from './portal/QuotesTable';
import { ProjectsView } from './portal/ProjectsView';
import { ActivityTimeline } from './portal/ActivityTimeline';
import { ProjectDetail } from './portal/ProjectDetail';
import { LogOutIcon, BellIcon } from './portal/PortalIcons';

export function PortalPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172B] via-slate-900 to-blue-950">
      {/* Portal Nav */}
      <header className="sticky top-0 z-50 bg-[#0F172B]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">BKT Advisory</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest border-l border-white/[0.1] pl-3">Client Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-400 hover:text-slate-200 transition-colors relative cursor-pointer">
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <Link to="/auth" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors">
              <LogOutIcon size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8 py-8">
        {selectedProject ? (
          <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
        ) : (
          <div className="space-y-6">
            {/* Welcome header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-50">Good afternoon, Sarah</h1>
              <p className="text-sm text-slate-400 mt-1">Here's a summary of your account and active engagements.</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Active Projects', value: '2', accent: 'from-blue-500 to-indigo-500' },
                { label: 'Pending Quotes', value: '3', accent: 'from-amber-500 to-orange-500' },
                { label: 'Items Awaiting You', value: '1', accent: 'from-cyan-500 to-blue-500' },
                { label: 'Completed', value: '1', accent: 'from-emerald-500 to-teal-500' },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{s.label}</p>
                  <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${s.accent} bg-clip-text text-transparent`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* User Profile */}
            <UserProfile />

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <QuotesTable />
                <ProjectsView onSelectProject={setSelectedProject} />
              </div>
              <div>
                <ActivityTimeline />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
