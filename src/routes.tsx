import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { AdminRoute } from './components/AdminRoute';

// ─── Marketing pages (lazy — not needed on initial landing) ───────────────────
const WorkPage = lazy(() => import('./components/WorkPage').then(m => ({ default: m.WorkPage })));
const ServicesPage = lazy(() => import('./components/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ProcessPage = lazy(() => import('./components/ProcessPage').then(m => ({ default: m.ProcessPage })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const EnvironmentsPage = lazy(() => import('./components/EnvironmentsPage').then(m => ({ default: m.EnvironmentsPage })));

// ─── Auth (lazy — not on landing) ─────────────────────────────────────────────
const AuthPage = lazy(() => import('./components/AuthPage').then(m => ({ default: m.AuthPage })));

// ─── Portal (lazy — authenticated-only) ───────────────────────────────────────
const PortalThemeLayout = lazy(() => import('./components/portal/PortalThemeLayout').then(m => ({ default: m.PortalThemeLayout })));
const PortalPage = lazy(() => import('./components/portal/PortalPage').then(m => ({ default: m.PortalPage })));

// ─── Admin portal (lazy — admin-only, heaviest section) ───────────────────────
const AdminPortalLayout = lazy(() => import('./components/admin/AdminPortalLayout').then(m => ({ default: m.AdminPortalLayout })));
const AdminDashboardPage = lazy(() => import('./components/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminActivitiesPage = lazy(() => import('./components/admin/AdminEntityPages').then(m => ({ default: m.AdminActivitiesPage })));
const AdminMilestonesPage = lazy(() => import('./components/admin/AdminEntityPages').then(m => ({ default: m.AdminMilestonesPage })));
const AdminProjectsPage = lazy(() => import('./components/admin/AdminEntityPages').then(m => ({ default: m.AdminProjectsPage })));
const AdminQuotesPage = lazy(() => import('./components/admin/AdminEntityPages').then(m => ({ default: m.AdminQuotesPage })));
const SalesPipelinePage = lazy(() => import('./components/admin/SalesPipelinePage').then(m => ({ default: m.SalesPipelinePage })));
const SalesContactsPage = lazy(() => import('./components/admin/SalesContactsPage').then(m => ({ default: m.SalesContactsPage })));
const SalesAccountsPage = lazy(() => import('./components/admin/SalesAccountsPage').then(m => ({ default: m.SalesAccountsPage })));
const SalesDealsPage = lazy(() => import('./components/admin/SalesDealsPage').then(m => ({ default: m.SalesDealsPage })));

// ─── Estimator (lazy — standalone heavy app) ──────────────────────────────────
const EstimatorAppShell = lazy(() => import('./components/EstimatorAppShell').then(m => ({ default: m.EstimatorAppShell })));

const PAGE_FALLBACK = (
  <div className="bkt-loading-screen">
    <div className="bkt-loading-spinner animate-spin" />
  </div>
);

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
    Component: PortalThemeLayout,
    children: [
      { index: true, Component: PortalPage },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Suspense fallback={PAGE_FALLBACK}>
              <AdminPortalLayout />
            </Suspense>
          </AdminRoute>
        ),
        children: [
          // Sales
          { index: true, Component: AdminDashboardPage },
          { path: 'pipeline', Component: SalesPipelinePage },
          { path: 'sales-contacts', Component: SalesContactsPage },
          { path: 'accounts', Component: SalesAccountsPage },
          { path: 'deals', Component: SalesDealsPage },
          // Delivery
          { path: 'quotes', Component: AdminQuotesPage },
          { path: 'projects', Component: AdminProjectsPage },
          { path: 'activities', Component: AdminActivitiesPage },
          { path: 'milestones', Component: AdminMilestonesPage },
          // Automation
          { path: 'automation', element: <div className="py-12 text-center text-sm text-slate-400">Workflow automation — coming in Phase 2.</div> },
        ],
      },
    ],
  },
  // Estimator — inline with PersonaFunnel (Tech vs Non-Tech fork)
  { path: '/estimator', Component: EstimatorAppShell },
]);
