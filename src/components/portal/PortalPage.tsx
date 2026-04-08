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
import {
  PORTAL_APP_SHELL_CLASS,
  PORTAL_HERO_SURFACE_CLASS,
  PORTAL_ICON_LOGO,
  PORTAL_ICON_LOGO_WHITE,
  PORTAL_ICON_BUTTON_CLASS,
  PORTAL_LOGO_DARK,
  PORTAL_LOGO_WHITE,
  PORTAL_PANEL_SURFACE_CLASS,
  PORTAL_SECONDARY_ACTION_CLASS,
  PORTAL_TAB_BAR_CLASS,
  PORTAL_TAB_BUTTON_ACTIVE_CLASS,
  PORTAL_TAB_BUTTON_BASE_CLASS,
  PORTAL_TAB_BUTTON_INACTIVE_CLASS,
  PORTAL_TOPBAR_CLASS,
} from './portalBranding';
  
const logoDark = {
  src: PORTAL_LOGO_DARK,
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
  src: PORTAL_ICON_LOGO_WHITE,
  className: '',
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
    <div className={PORTAL_APP_SHELL_CLASS}>
      {/* Portal Nav */}
      <header className={PORTAL_TOPBAR_CLASS}>
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
                to="/portal/admin"
                className={PORTAL_SECONDARY_ACTION_CLASS}
              >
                <ShieldIcon size={15} />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
            <button className={`${PORTAL_ICON_BUTTON_CLASS} relative`}>
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button
              onClick={() => openSettings('profile')}
              className={PORTAL_ICON_BUTTON_CLASS}
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
              className={`${PORTAL_SECONDARY_ACTION_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}
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
            <div className={`${PORTAL_HERO_SURFACE_CLASS} space-y-6 p-8`}>
              <div>
                <h1 className="text-2xl font-bold text-slate-50">{getGreeting()}{firstName ? `, ${firstName}` : ''}</h1>
                <p className="mt-1 text-sm text-slate-200">Here's a summary of your account and active engagements.</p>
              </div>

              <UserProfile onEditProfile={() => openSettings('profile')} />

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: 'Active Projects', value: '2', accent: 'from-blue-500 to-indigo-500' },
                  { label: 'Pending Quotes', value: '3', accent: 'from-amber-500 to-orange-500' },
                  { label: 'Items Awaiting You', value: '1', accent: 'from-cyan-500 to-blue-500' },
                  { label: 'Completed', value: '1', accent: 'from-emerald-500 to-teal-500' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-200">{s.label}</p>
                    <p className={`mt-1.5 text-2xl font-bold bg-gradient-to-r ${s.accent} bg-clip-text text-transparent`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Two-column layout: Tabbed Content (left) + Activity Sidebar (right) */}
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              {/* Left: Tabbed Quotes/Projects Container */}
              <div className={`${PORTAL_PANEL_SURFACE_CLASS} overflow-visible`}>
                {/* Tab Buttons + Actions */}
                <div className={`${PORTAL_TAB_BAR_CLASS} flex-wrap items-center gap-3 overflow-visible px-4 py-4 sm:flex-nowrap`}>
                  <div className="flex min-w-0 flex-1 gap-0">
                    <button
                      onClick={() => setActiveTab('quotes')}
                      className={`${PORTAL_TAB_BUTTON_BASE_CLASS} flex-1 px-6 py-4 text-sm ${
                        activeTab === 'quotes' ? PORTAL_TAB_BUTTON_ACTIVE_CLASS : PORTAL_TAB_BUTTON_INACTIVE_CLASS
                      }`}
                    >
                      Quotes
                    </button>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className={`${PORTAL_TAB_BUTTON_BASE_CLASS} flex-1 px-6 py-4 text-sm ${
                        activeTab === 'projects' ? PORTAL_TAB_BUTTON_ACTIVE_CLASS : PORTAL_TAB_BUTTON_INACTIVE_CLASS
                      }`}
                    >
                      Projects
                    </button>
                  </div>
                  <div className="relative z-20 flex shrink-0 justify-end">
                    <ActionDropdown
                      label="Actions"
                      userRole={role}
                      context="dashboard"
                      onAction={setActiveModal}
                    />
                  </div>
                </div>

                {/* Tab Content */}
                <div className="overflow-hidden rounded-b-2xl">
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
              <button type="submit" className="bkt-primary-button">Submit</button>
            </div>
          </form>
        </PortalModal>
      )}
    </div>
  );
}
