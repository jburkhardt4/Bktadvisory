import type { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  ActivityIcon,
  ArrowLeftIcon,
  FileTextIcon,
  FolderIcon,
  ShieldIcon,
  TargetIcon,
} from '../portal/PortalIcons';

interface AdminSectionDefinition {
  slug: 'quotes' | 'projects' | 'activities' | 'milestones';
  label: string;
  description: string;
  icon: ReactNode;
}

export const adminSections: AdminSectionDefinition[] = [
  {
    slug: 'quotes',
    label: 'Quotes',
    description: 'Review and manage quote requests, assignment, and pricing details.',
    icon: <FileTextIcon size={16} />,
  },
  {
    slug: 'projects',
    label: 'Projects',
    description: 'Control active delivery work, ownership, and project metadata.',
    icon: <FolderIcon size={16} />,
  },
  {
    slug: 'activities',
    label: 'Activities',
    description: 'Manage the client-facing activity stream and supporting updates.',
    icon: <ActivityIcon size={16} />,
  },
  {
    slug: 'milestones',
    label: 'Milestones',
    description: 'Track delivery checkpoints and prepare milestone CRUD workflows.',
    icon: <TargetIcon size={16} />,
  },
];

export const DEFAULT_ADMIN_SECTION = adminSections[0].slug;

interface AdminSectionPlaceholderProps {
  title: string;
  description: string;
  nextStep: string;
}

export function AdminPortalLayout() {
  const { session } = useAuth();
  const adminEmail = session?.user?.email ?? 'Admin account';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/20">
        <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6 xl:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              <ShieldIcon size={18} />
            </span>
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
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 shadow-lg dark:border-slate-800">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
              Protected Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">BKT Advisory Admin Control Center</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This route branch is now protected by role-based access control. Step 7 will turn these sections
              into full CRUD workspaces for quotes, projects, activities, and milestones.
            </p>
          </div>
        </section>

        <nav className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin sections">
          {adminSections.map((section) => (
            <NavLink
              key={section.slug}
              to={`/portal/admin/${section.slug}`}
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
                  {section.icon}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{section.label}</p>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{section.description}</p>
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

export function AdminSectionPlaceholder({
  title,
  description,
  nextStep,
}: AdminSectionPlaceholderProps) {
  return (
    <section className="p-6 sm:p-8">
      <div className="max-w-3xl space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
            Admin Section
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
          {nextStep}
        </div>
      </div>
    </section>
  );
}
