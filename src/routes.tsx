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
          { path: 'deals', element: <SalesDealsPage /> },
          // Sales — additional
          { path: 'calendar', element: <div className="py-12 text-center text-sm text-slate-400">Calendar — coming soon.</div> },
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
