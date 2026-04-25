import { createBrowserRouter } from 'react-router';
import type { ComponentType } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';

// ── Route-level code-splitting ──────────────────────────────────────────────
// Each lazy() below becomes its own chunk; public visitors never download
// admin/portal/estimator JavaScript unless they navigate there.
const lazyComponent =
  <T extends Record<string, unknown>>(loader: () => Promise<T>, exportName: keyof T) =>
  async () => {
    const mod = await loader();
    return { Component: mod[exportName] as ComponentType };
  };

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'work',
        lazy: lazyComponent(() => import('./components/WorkPage'), 'WorkPage'),
      },
      {
        path: 'services',
        lazy: lazyComponent(() => import('./components/ServicesPage'), 'ServicesPage'),
      },
      {
        path: 'process',
        lazy: lazyComponent(() => import('./components/ProcessPage'), 'ProcessPage'),
      },
      {
        path: 'about',
        lazy: lazyComponent(() => import('./components/AboutPage'), 'AboutPage'),
      },
      {
        path: 'environments',
        lazy: lazyComponent(() => import('./components/EnvironmentsPage'), 'EnvironmentsPage'),
      },
      // Catch-all: fallback to Home
      { path: '*', Component: HomePage },
    ],
  },
  // Auth is a top-level route (no Layout shell)
  {
    path: '/auth',
    lazy: lazyComponent(() => import('./components/AuthPage'), 'AuthPage'),
  },
  // Schedule — standalone shareable page (no nav/footer)
  {
    path: '/schedule',
    lazy: lazyComponent(() => import('./components/BookingPage'), 'BookingPage'),
  },
  // Portal routes — auth-guarded
  {
    path: '/portal',
    lazy: async () => {
      const { PortalThemeLayout } = await import('./components/portal/PortalThemeLayout');
      return { element: <PortalThemeLayout /> };
    },
    children: [
      {
        index: true,
        lazy: lazyComponent(() => import('./components/portal/PortalPage'), 'PortalPage'),
      },
      {
        path: 'admin',
        lazy: async () => {
          const [{ AdminRoute }, { AdminPortalLayout }] = await Promise.all([
            import('./components/AdminRoute'),
            import('./components/admin/AdminPortalLayout'),
          ]);
          return {
            element: (
              <AdminRoute>
                <AdminPortalLayout />
              </AdminRoute>
            ),
          };
        },
        children: [
          // Sales
          {
            index: true,
            lazy: lazyComponent(
              () => import('./components/admin/AdminDashboardPage'),
              'AdminDashboardPage',
            ),
          },
          {
            path: 'pipeline',
            lazy: lazyComponent(
              () => import('./components/admin/SalesPipelinePage'),
              'SalesPipelinePage',
            ),
          },
          {
            path: 'sales-contacts',
            lazy: lazyComponent(
              () => import('./components/admin/SalesContactsPage'),
              'SalesContactsPage',
            ),
          },
          {
            path: 'accounts',
            lazy: lazyComponent(
              () => import('./components/admin/SalesAccountsPage'),
              'SalesAccountsPage',
            ),
          },
          {
            path: 'accounts/:id',
            lazy: lazyComponent(
              () => import('./components/admin/AccountDetailPage'),
              'AccountDetailPage',
            ),
          },
          {
            path: 'sales-contacts/:id',
            lazy: lazyComponent(
              () => import('./components/admin/ContactDetailPage'),
              'ContactDetailPage',
            ),
          },
          {
            path: 'contacts/:id',
            lazy: lazyComponent(
              () => import('./components/admin/ContactDetailPage'),
              'ContactDetailPage',
            ),
          },
          {
            path: 'deals',
            lazy: lazyComponent(
              () => import('./components/admin/SalesDealsPage'),
              'SalesDealsPage',
            ),
          },
          {
            path: 'deals/:id',
            lazy: lazyComponent(
              () => import('./components/admin/DealDetailPage'),
              'DealDetailPage',
            ),
          },
          // Sales — additional
          {
            path: 'calendar',
            element: (
              <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">Calendar</h2>
                <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700" style={{ paddingBottom: '75%' }}>
                  <iframe
                    src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FLos_Angeles&showPrint=0&src=am9obkBia3RhZHZpc29yeS5jb20&src=YXBwb2ludG1lbnRzQGJrdGFkdmlzb3J5LmNvbQ&src=Z3VubmFyY2JhcmNvbWJAZ21haWwuY29t&color=%23162556&color=%23d50000&color=%237cb342"
                    title="BKT Advisory Calendar"
                    className="absolute inset-0 h-full w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </div>
            ),
          },
          { path: 'reports', element: <div className="py-12 text-center text-sm text-slate-400">Reports & Dashboards — coming soon.</div> },
          // Delivery
          {
            path: 'quotes',
            lazy: lazyComponent(
              () => import('./components/admin/AdminEntityPages'),
              'AdminQuotesPage',
            ),
          },
          {
            path: 'projects',
            lazy: lazyComponent(
              () => import('./components/admin/AdminEntityPages'),
              'AdminProjectsPage',
            ),
          },
          {
            path: 'activities',
            lazy: lazyComponent(
              () => import('./components/admin/AdminEntityPages'),
              'AdminActivitiesPage',
            ),
          },
          {
            path: 'milestones',
            lazy: lazyComponent(
              () => import('./components/admin/AdminEntityPages'),
              'AdminMilestonesPage',
            ),
          },
          { path: 'approvals', element: <div className="py-12 text-center text-sm text-slate-400">Client Approvals — coming soon.</div> },
          // AI / Automations
          { path: 'automation', element: <div className="py-12 text-center text-sm text-slate-400">Agent Workflows — coming in Phase 2.</div> },
          { path: 'prompt-library', element: <div className="py-12 text-center text-sm text-slate-400">Prompt Library — coming soon.</div> },
          { path: 'automation-rules', element: <div className="py-12 text-center text-sm text-slate-400">Automation Rules — coming soon.</div> },
          { path: 'analytics', element: <div className="py-12 text-center text-sm text-slate-400">AI Analytics — coming soon.</div> },
        ],
      },
    ],
  },
  // Estimator — inline with PersonaFunnel (Tech vs Non-Tech fork)
  {
    path: '/estimator',
    lazy: lazyComponent(() => import('./components/EstimatorAppShell'), 'EstimatorAppShell'),
  },
]);
