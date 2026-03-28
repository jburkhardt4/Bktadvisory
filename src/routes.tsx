import { createBrowserRouter, Outlet } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { WorkPage } from './components/WorkPage';
import { ServicesPage } from './components/ServicesPage';
import { ProcessPage } from './components/ProcessPage';
import { AboutPage } from './components/AboutPage';
import { AuthPage } from './components/AuthPage';
import { PortalPage } from './components/portal/PortalPage';
import { EstimatorBoundary } from './components/EstimatorBoundary';
import { RequireAuth } from './components/RequireAuth';
import { AdminRoute } from './components/AdminRoute';
import { AdminPortalLayout } from './components/admin/AdminPortalLayout';
import { AdminDashboardPage } from './components/admin/AdminDashboardPage';
import {
  AdminActivitiesPage,
  AdminMilestonesPage,
  AdminProjectsPage,
  AdminQuotesPage,
} from './components/admin/AdminEntityPages';

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
      // Catch-all: fallback to Home
      { path: '*', Component: HomePage },
    ],
  },
  // Auth is a top-level route (no Layout shell)
  { path: '/auth', Component: AuthPage },
  // Portal routes — auth-guarded
  {
    path: '/portal',
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
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
          { index: true, element: <AdminDashboardPage /> },
          { path: 'quotes', element: <AdminQuotesPage /> },
          { path: 'projects', element: <AdminProjectsPage /> },
          { path: 'activities', element: <AdminActivitiesPage /> },
          { path: 'milestones', element: <AdminMilestonesPage /> },
        ],
      },
    ],
  },
  // Estimator boundary — redirects to the standalone estimator app
  { path: '/estimator', Component: EstimatorBoundary },
]);
