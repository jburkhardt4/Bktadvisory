import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { PortalProfileProvider, usePortalProfile } from '../../contexts/PortalProfileContext';
import { clearSession } from '../../utils/authSession';
import { UserProfile } from './UserProfile';
import { QuotesTable } from './QuotesTable';
import { ProjectsView } from './ProjectsView';
import { ActivityTimeline } from './ActivityTimeline';
import { ProjectDetail } from './ProjectDetail';
import { LogOutIcon, BellIcon, ShieldIcon } from './PortalIcons';
import { SettingsIcon } from './PortalIcons';
import { ActionDropdown } from './ActionDropdown';
import { PortalModal } from './PortalModal';
import { SettingsModal, type SettingsCategory } from './SettingsModal';
import { CreateQuoteForm } from './forms/CreateQuoteForm';
import { CreateProjectForm } from './forms/CreateProjectForm';
import { AddActivityForm } from './forms/AddActivityForm';

import logo from 'figma:asset/01ab4ddf9498ad72150c22c58a71c1af4fd5772b.png';

const PORTAL_ICON_LOGO =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Icon%20Logo%20(Transparent).png';

const PORTAL_LOGO_WHITE =
  'https://hjrvtzkktodoxigezxqy.supabase.co/storage/v1/object/public/Logos/BKT%20Advisory%20-%20Portal%20Horizontal_White%20(Dark%20Theme)%20-%20HD.png';
  
const logoDark = {
  src: logo,
  className: '',
};

const logoLight = {
  src: PORTAL_LOGO_WHITE,
  className: '',
};

const iconDark = {
  src: PORTAL_ICON_LOGO,
  className: '',
};

const iconLight = {
  src: PORTAL_ICON_LOGO,
  className:
    'brightness-[1.14] contrast-[1.08] drop-shadow-[0_0_14px_rgba(248,250,252,0.18)]',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function PortalPage() {
  return (
    <PortalProfileProvider>
      <PortalPageContent />
    </PortalProfileProvider>
  );
}

function PortalPageContent() {
  const { role } = useAuth();
  const { resolvedTheme } = useTheme();
  const { profile } = usePortalProfile();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'projects'>('projects');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [settingsCategory, setSettingsCategory] = useState<SettingsCategory>('profile');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const firstName = profile?.firstName || null;
  const isDarkTheme = themeReady && resolvedTheme === 'dark';
  const headerLogo = isDarkTheme ? logoLight : logoDark;
  const headerIcon = isDarkTheme ? iconLight : iconDark;

  useEffect(() => {
    setThemeReady(true);
  }, []);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await clearSession();
    } catch (error) {
      console.error('Failed to sign out cleanly.', error);
    }

    navigate('/auth', { replace: true });
  }

  function openSettings(category: SettingsCategory = 'profile') {
    setSettingsCategory(category);
    setActiveModal('settings');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Portal Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={headerLogo.src}
              alt="BKT Advisory"
              className={`hidden h-8 w-auto transition-[filter] duration-200 sm:block ${headerLogo.className}`}
            />
            <img
              src={headerIcon.src}
              alt="BKT"
              className={`h-8 w-auto transition-[filter] duration-200 sm:hidden ${headerIcon.className}`}
            />
            <span className="hidden border-l border-slate-300 pl-3 text-xs font-semibold uppercase tracking-widest text-slate-700 sm:inline dark:border-slate-700 dark:text-slate-300">Client Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            {role === 'admin' && (
              <Link
                to="/portal/admin/quotes"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-[#1d293d] transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ShieldIcon size={15} />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
            <button className="relative cursor-pointer rounded-lg p-2 text-[#1d293d] transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button
              onClick={() => openSettings('profile')}
              className="cursor-pointer rounded-lg p-2 text-[#1d293d] transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <SettingsIcon size={18} />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={() => {
                void handleSignOut();
              }}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#1d293d] transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOutIcon size={15} />
              <span className="hidden sm:inline">{isSigningOut ? 'Signing Out…' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-8 py-8">
        {selectedProject ? (
          <ProjectDetail projectId={selectedProject} onBack={() => setSelectedProject(null)} />
        ) : (
          <div className="space-y-6">
            {/* Hero Section with Dark Gradient - Welcome + User Profile */}
            <div className="bg-gradient-to-br from-[#0F172B] via-slate-800 to-purple-950 rounded-2xl p-8 shadow-lg border border-slate-700/50">
              <div className="space-y-6">
                {/* Welcome header */}
                <div>
                  <h1 className="text-2xl font-bold text-slate-50">{getGreeting()}{firstName ? `, ${firstName}` : ''}</h1>
                  <p className="text-sm text-slate-400 mt-1">Here's a summary of your account and active engagements.</p>
                </div>

                {/* User Profile */}
                <UserProfile onEditProfile={() => openSettings('profile')} />

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
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                {/* Tab Buttons + Actions */}
                <div className="flex items-center border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-1 gap-0">
                    <button
                      onClick={() => setActiveTab('quotes')}
                      className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === 'quotes'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-200'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-50'
                      }`}
                    >
                      Quotes
                    </button>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === 'projects'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-200'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-50'
                      }`}
                    >
                      Projects
                    </button>
                  </div>
                  <div className="px-4">
                    <ActionDropdown
                      label="Actions"
                      userRole={role}
                      context="dashboard"
                      onAction={setActiveModal}
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

      {/* Action Modals */}
      {activeModal === 'create-quote' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Create Quote">
          <CreateQuoteForm onClose={() => setActiveModal(null)} />
        </PortalModal>
      )}
      {activeModal === 'create-project' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Create Project">
          <CreateProjectForm onClose={() => setActiveModal(null)} />
        </PortalModal>
      )}
      {activeModal === 'add-activity' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Add Activity">
          <AddActivityForm onClose={() => setActiveModal(null)} />
        </PortalModal>
      )}
      {activeModal === 'settings' && (
        <SettingsModal
          open
          initialCategory={settingsCategory}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'request-scope-change' && (
        <PortalModal open onClose={() => setActiveModal(null)} title="Request Scope Change">
          <form onSubmit={e => { e.preventDefault(); setActiveModal(null); }} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
              <textarea rows={3} className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400" placeholder="Describe the scope change…" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all">Submit</button>
            </div>
          </form>
        </PortalModal>
      )}
    </div>
  );
}
