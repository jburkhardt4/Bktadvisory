import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { clearSession } from '../../utils/authSession';
import { AdminCrmProvider, useAdminCrm } from './AdminCrmContext';
import { SalesCrmProvider, useSalesCrm } from './SalesCrmContext';
import {
  ActivityIcon,
  BriefcaseIcon,
  BuildingIcon,
  FileTextIcon,
  FolderIcon,
  LayersIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from '../portal/PortalIcons';
import {
  PORTAL_APP_SHELL_CLASS,
  PORTAL_APP_URL,
  PORTAL_HERO_SURFACE_CLASS,
  PORTAL_ICON_LOGO,
  PORTAL_ICON_BUTTON_CLASS,
  PORTAL_PANEL_SURFACE_CLASS,
  PORTAL_SECONDARY_ACTION_CLASS,
  PORTAL_TOPBAR_CLASS,
} from '../portal/portalBranding';

interface AdminNavigationItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
  end?: boolean;
}

interface AdminNavigationGroup {
  title: string;
  items: AdminNavigationItem[];
}

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
  const { quotes, projects, activities, milestones, loading } = useAdminCrm();
  const { deals, contacts: salesContacts, accounts, loading: salesLoading } = useSalesCrm();
  const navigate = useNavigate();
  const adminEmail = session?.user?.email ?? 'Admin account';
  const isLoading = loading || salesLoading;

  async function handleSignOut() {
    await clearSession();
    navigate('/auth', { replace: true });
  }

  const navigationGroups: AdminNavigationGroup[] = [
    {
      title: 'Sales',
      items: [
        {
          path: '/portal/admin',
          label: 'Overview',
          description: 'Master CRM dashboard',
          icon: <LayersIcon size={16} />,
          end: true,
        },
        {
          path: '/portal/admin/pipeline',
          label: 'Pipeline',
          description: 'Visual deal board',
          icon: <TrendingUpIcon size={16} />,
          count: deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
        },
        {
          path: '/portal/admin/sales-contacts',
          label: 'Contacts',
          description: 'Prospects and leads',
          icon: <UsersIcon size={16} />,
          count: salesContacts.length,
        },
        {
          path: '/portal/admin/accounts',
          label: 'Accounts',
          description: 'Companies and orgs',
          icon: <BuildingIcon size={16} />,
          count: accounts.length,
        },
        {
          path: '/portal/admin/deals',
          label: 'Deals',
          description: 'All deal records',
          icon: <BriefcaseIcon size={16} />,
          count: deals.length,
        },
      ],
    },
    {
      title: 'Delivery',
      items: [
        {
          path: '/portal/admin/quotes',
          label: 'Quotes',
          description: 'Pricing and assignments',
          icon: <FileTextIcon size={16} />,
          count: quotes.length,
        },
        {
          path: '/portal/admin/projects',
          label: 'Projects',
          description: 'Delivery management',
          icon: <FolderIcon size={16} />,
          count: projects.length,
        },
        {
          path: '/portal/admin/activities',
          label: 'Activities',
          description: 'Timeline control',
          icon: <ActivityIcon size={16} />,
          count: activities.length,
        },
        {
          path: '/portal/admin/milestones',
          label: 'Milestones',
          description: 'Delivery checkpoints',
          icon: <TargetIcon size={16} />,
          count: milestones.length,
        },
      ],
    },
    {
      title: 'Automation',
      items: [
        {
          path: '/portal/admin/automation',
          label: 'Workflows',
          description: 'Coming soon',
          icon: <ZapIcon size={16} />,
        },
      ],
    },
  ];

  return (
    <div className={PORTAL_APP_SHELL_CLASS}>
      <header className={PORTAL_TOPBAR_CLASS}>
        <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 xl:px-8">
          <div className="flex items-center gap-3">
            <a
              href={PORTAL_APP_URL}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:shadow-none dark:focus-visible:ring-offset-slate-950"
            >
              <img
                src={PORTAL_ICON_LOGO}
                alt="BKT Advisory Portal"
                className="h-6 w-6 scale-[1.3] object-contain"
              />
            </a>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Admin Panel</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{adminEmail}</p>
            </div>
          </div>

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

      <main className="max-w-[1440px] mx-auto space-y-6 px-4 py-8 sm:px-6 xl:px-8">
        <section className={`${PORTAL_HERO_SURFACE_CLASS} p-8`}>
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
              Protected Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">BKT Advisory CRM Control Center</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Review every record across the portal, manage client ownership, and keep projects, activities,
              and milestones aligned from one protected admin workspace.
            </p>
          </div>
        </section>

        <nav className="space-y-4" aria-label="Admin sections">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {group.title}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-2xl border p-4 transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-900/80'
                      }`
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {item.icon}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.label}</p>
                          {typeof item.count === 'number' && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {isLoading ? '…' : item.count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={PORTAL_PANEL_SURFACE_CLASS}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
