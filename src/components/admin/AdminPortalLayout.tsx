import { Link, Outlet, useNavigate } from 'react-router';
import { useTheme } from 'next-themes';
import { useAuth } from '../../contexts/AuthContext';
import { clearSession } from '../../utils/authSession';
import { AdminCrmProvider, useAdminCrm } from './AdminCrmContext';
import { SalesCrmProvider, useSalesCrm } from './SalesCrmContext';
import { AdminTopNav, type NavCounts } from './AdminTopNav';
import {
  PORTAL_APP_SHELL_CLASS,
  PORTAL_APP_URL,
  PORTAL_ICON_LOGO,
  PORTAL_ICON_LOGO_WHITE,
  PORTAL_ICON_BUTTON_CLASS,
  PORTAL_PANEL_SURFACE_CLASS,
  PORTAL_SECONDARY_ACTION_CLASS,
  PORTAL_TOPBAR_CLASS,
} from '../portal/portalBranding';

export function AdminPortalLayout() {
  return (
    <AdminCrmProvider>
      <SalesCrmProvider>
        <AdminPortalScaffold />
      </SalesCrmProvider>
    </AdminCrmProvider>
  );
}

function AdminPortalScaffold() {
  const { session } = useAuth();
  const { resolvedTheme } = useTheme();
  const { quotes, projects, activities, milestones, loading } = useAdminCrm();
  const { deals, contacts: salesContacts, accounts, loading: salesLoading } = useSalesCrm();
  const navigate = useNavigate();
  const adminEmail = session?.user?.email ?? 'Admin account';
  const isLoading = loading || salesLoading;
  const iconSrc = resolvedTheme === 'dark' ? PORTAL_ICON_LOGO_WHITE : PORTAL_ICON_LOGO;

  async function handleSignOut() {
    await clearSession();
    navigate('/auth', { replace: true });
  }

  const counts: NavCounts = isLoading
    ? {}
    : {
        activeDeals: String(deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length),
        contacts: String(salesContacts.length),
        accounts: String(accounts.length),
        deals: String(deals.length),
        quotes: String(quotes.length),
        projects: String(projects.length),
        activities: String(activities.length),
        milestones: String(milestones.length),
      };

  return (
    <div className={PORTAL_APP_SHELL_CLASS}>
      <header className={PORTAL_TOPBAR_CLASS}>
        <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 xl:px-8">
          {/* Left: Logo + brand + nav */}
          <div className="flex items-center gap-4">
            <a
              href={PORTAL_APP_URL}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:shadow-none dark:focus-visible:ring-offset-slate-950"
            >
              <img
                src={iconSrc}
                alt="BKT Advisory Portal"
                className="h-6 w-6 scale-[1.3] object-contain"
              />
            </a>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Sales Console</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{adminEmail}</p>
            </div>

            {/* Divider between brand and nav */}
            <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800" />

            <AdminTopNav counts={counts} />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/portal"
              className={PORTAL_SECONDARY_ACTION_CLASS}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden sm:inline">Client Portal</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <button className={`${PORTAL_ICON_BUTTON_CLASS} relative`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>
            <button className={PORTAL_ICON_BUTTON_CLASS}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              onClick={() => { void handleSignOut(); }}
              className={`${PORTAL_SECONDARY_ACTION_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 py-6 sm:px-6 xl:px-8">
        <div className={PORTAL_PANEL_SURFACE_CLASS}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
