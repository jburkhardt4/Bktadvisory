import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { AdminCrmProvider, useAdminCrm } from './AdminCrmContext';
import {
  ActivityIcon,
  ArrowLeftIcon,
  FileTextIcon,
  FolderIcon,
  LayersIcon,
  TargetIcon,
} from '../portal/PortalIcons';
import {
  PORTAL_APP_URL,
  PORTAL_HERO_SURFACE_CLASS,
  PORTAL_ICON_LOGO,
} from '../portal/portalBranding';

interface AdminNavigationItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  count?: number;
  end?: boolean;
}

export function AdminPortalLayout() {
  return (
    <AdminCrmProvider>
      <AdminPortalScaffold />
    </AdminCrmProvider>
  );
}

function AdminPortalScaffold() {
  const { session } = useAuth();
  const { quotes, projects, activities, milestones, loading } = useAdminCrm();
  const adminEmail = session?.user?.email ?? 'Admin account';

  const navigationItems: AdminNavigationItem[] = [
    {
      path: '/portal/admin',
      label: 'Overview',
      description: 'Master CRM dashboard',
      icon: <LayersIcon size={16} />,
      end: true,
    },
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
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/20">
        <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 xl:px-8">
          <div className="flex items-center gap-3">
            <a
              href={PORTAL_APP_URL}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
            >
              <img
                src={PORTAL_ICON_LOGO}
                alt="BKT Advisory Portal"
                className="h-6 w-6 object-contain"
              />
            </a>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Admin Panel</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{adminEmail}</p>
            </div>
          </div>

          <Link
            to="/portal"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <ArrowLeftIcon size={14} />
            <span className="hidden sm:inline">Client Portal</span>
            <span className="sm:hidden">Back</span>
          </Link>
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

        <nav className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Admin sections">
          {navigationItems.map((item) => (
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
                        {loading ? '…' : item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
