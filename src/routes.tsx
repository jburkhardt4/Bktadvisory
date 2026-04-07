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
import { AdminContactsPage } from './components/admin/AdminContactsPage';
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
          { index: true, element: <AdminDashboardPage /> },
          { path: 'quotes', element: <AdminQuotesPage /> },
          { path: 'projects', element: <AdminProjectsPage /> },
          { path: 'activities', element: <AdminActivitiesPage /> },
          { path: 'milestones', element: <AdminMilestonesPage /> },
          { path: 'contacts', element: <AdminContactsPage /> },
        ],
      },
    ],
  },
  // Estimator — inline with PersonaFunnel (Tech vs Non-Tech fork)
  { path: '/estimator', Component: EstimatorAppShell },
]);
