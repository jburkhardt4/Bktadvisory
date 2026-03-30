import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from './portalData';
import { UserProfile } from './UserProfile';
import { QuotesTable } from './QuotesTable';
import { ProjectsView } from './ProjectsView';
import { ActivityTimeline } from './ActivityTimeline';
import { ProjectDetail } from './ProjectDetail';
import { LogOutIcon, BellIcon, SettingsIcon, FileTextIcon, FolderIcon, ActivityIcon, PenIcon } from './PortalIcons';
import { ActionDropdown } from './ActionDropdown';
import { PORTAL_BRANDING } from './portalBranding';

export function PortalPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'projects'>('projects');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Portal Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src={PORTAL_BRANDING.fullLogoUrl} alt="BKT Advisory" className="h-8 w-auto hidden sm:block" />
            <img src={PORTAL_BRANDING.iconLogoUrl} alt="BKT" className="h-8 w-auto sm:hidden" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest border-l border-slate-300 pl-3 hidden sm:inline">Client Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-[#1d293d] transition-colors relative cursor-pointer">
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 text-[#1d293d] transition-colors cursor-pointer">
              <SettingsIcon size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <Link to="/auth" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[#1d293d] hover:bg-slate-100 rounded-lg transition-colors">
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
            {/* Hero Section with Dark Gradient - Welcome + User Profile */}
            <div className="bg-gradient-to-br from-[#0F172B] via-slate-800 to-purple-950 rounded-2xl p-8 shadow-lg border border-slate-700/50">
              <div className="space-y-6">
                {/* Welcome header */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-50">Good afternoon, Sarah</h1>
                  <p className="text-sm text-slate-400 mt-1">Here's a summary of your account and active engagements.</p>
                </div>

                {/* User Profile */}
                <UserProfile />

                {/* Stat cards - Reduced height by ~30% */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Active Projects', value: '2', accent: 'from-blue-500 to-indigo-500' },
                    { label: 'Pending Quotes', value: '3', accent: 'from-amber-500 to-orange-500' },
                    { label: 'Items Awaiting You', value: '1', accent: 'from-cyan-500 to-blue-500' },
                    { label: 'Completed', value: '1', accent: 'from-emerald-500 to-teal-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{s.label}</p>
                      <p className={`text-2xl font-bold mt-1.5 bg-gradient-to-r ${s.accent} bg-clip-text text-transparent`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Two-column layout: Tabbed Content (left) + Activity Sidebar (right) */}
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              {/* Left: Tabbed Quotes/Projects Container */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Tab Buttons + Actions */}
                <div className="flex items-center border-b border-slate-200">
                  <div className="flex flex-1 gap-0">
                    <button
                      onClick={() => setActiveTab('quotes')}
                      className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === 'quotes'
                          ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Quotes
                    </button>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === 'projects'
                          ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Projects
                    </button>
                  </div>
                  <div className="px-4">
                    <ActionDropdown
                      label="Actions"
                      items={[
                        { label: 'Create Quote', icon: <FileTextIcon size={15} /> },
                        { label: 'Create Project', icon: <FolderIcon size={15} /> },
                        { label: 'Add Activity', icon: <ActivityIcon size={15} /> },
                        { label: 'Request Scope Change', icon: <PenIcon size={15} /> },
                      ]}
                    />
                  </div>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'quotes' ? (
                    <QuotesTable />
                  ) : (
                    <ProjectsView onSelectProject={setSelectedProject} />
                  )}
                </div>
              </div>

              {/* Right: Activity Sidebar */}
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