import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { WorkPage } from './components/WorkPage';
import { ServicesPage } from './components/ServicesPage';
import { ProcessPage } from './components/ProcessPage';
import { AboutPage } from './components/AboutPage';
import { EnvironmentsPage } from './components/EnvironmentsPage';
import { AuthPage } from './components/AuthPage';
import { PortalPage } from './components/portal/PortalPage';
import { PortalThemeLayout } from './components/portal/PortalThemeLayout';
import { EstimatorAppShell } from './components/EstimatorAppShell';
import { AdminRoute } from './components/AdminRoute';
import { AdminPortalLayout } from './components/admin/AdminPortalLayout';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import {
  AdminActivitiesPage,
  AdminMilestonesPage,
  AdminProjectsPage,
  AdminQuotesPage,
} from './components/admin/AdminEntityPages';
import { SalesPipelinePage } from './components/admin/SalesPipelinePage';
import { SalesContactsPage } from './components/admin/SalesContactsPage';
import { SalesAccountsPage } from './components/admin/SalesAccountsPage';
import { SalesDealsPage } from './components/admin/SalesDealsPage';
import { AccountDetailPage } from './components/admin/AccountDetailPage';
import { ContactDetailPage } from './components/admin/ContactDetailPage';
import { DealDetailPage } from './components/admin/DealDetailPage';
import { BookingPage } from './components/BookingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'work', Component: WorkPage },
      { path: 'services', Component: ServicesPage },
      { path: 'process', Component: ProcessPage },
      { path: 'about', Component: AboutPage },
      { path: 'environments', Component: EnvironmentsPage },
      { path: 'schedule', Component: BookingPage },
      // Catch-all: fallback to Home
      { path: '*', Component: HomePage },
    ],
  },
  // Auth is a top-level route (no Layout shell)
  { path: '/auth', Component: AuthPage },
  // Portal routes — auth-guarded
  {
    path: '/portal',
    element: <PortalThemeLayout />,
    children: [
      { index: true, element: <PortalPage /> },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminPortalLayout />
          </AdminRoute>
        ),
        children: [
          // Sales
          { index: true, element: <AdminDashboardPage /> },
          { path: 'pipeline', element: <SalesPipelinePage /> },
          { path: 'sales-contacts', element: <SalesContactsPage /> },
          { path: 'accounts', element: <SalesAccountsPage /> },
          { path: 'accounts/:id', element: <AccountDetailPage /> },
          { path: 'sales-contacts/:id', element: <ContactDetailPage /> },
          { path: 'contacts/:id', element: <ContactDetailPage /> },
          { path: 'deals', element: <SalesDealsPage /> },
          { path: 'deals/:id', element: <DealDetailPage /> },
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
          { path: 'quotes', element: <AdminQuotesPage /> },
          { path: 'projects', element: <AdminProjectsPage /> },
          { path: 'activities', element: <AdminActivitiesPage /> },
          { path: 'milestones', element: <AdminMilestonesPage /> },
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
  { path: '/estimator', Component: EstimatorAppShell },
]);
