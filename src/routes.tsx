import { createBrowserRouter, Navigate, Outlet } from 'react-router';
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
import {
  AdminPortalLayout,
  AdminSectionPlaceholder,
  DEFAULT_ADMIN_SECTION,
} from './components/admin/AdminPortalLayout';

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
          { index: true, element: <Navigate to={DEFAULT_ADMIN_SECTION} replace /> },
          {
            path: 'quotes',
            element: (
              <AdminSectionPlaceholder
                title="Quotes"
                description="This protected route is ready for the upcoming admin CRUD tooling around quote ownership, pricing, and lifecycle updates."
                nextStep="Step 7 will replace this placeholder with the full quotes management table, filters, and edit forms."
              />
            ),
          },
          {
            path: 'projects',
            element: (
              <AdminSectionPlaceholder
                title="Projects"
                description="This protected route is reserved for the admin project workspace, including owner updates, descriptions, and cross-client management."
                nextStep="Step 7 will add the projects CRUD surface and connect it to milestones and activities."
              />
            ),
          },
          {
            path: 'activities',
            element: (
              <AdminSectionPlaceholder
                title="Activities"
                description="This protected route will host the admin controls for timeline events, communication records, and project activity management."
                nextStep="Step 7 will add activity creation, editing, and deletion flows here."
              />
            ),
          },
          {
            path: 'milestones',
            element: (
              <AdminSectionPlaceholder
                title="Milestones"
                description="This protected route will support milestone scheduling, status updates, and sequencing controls for every client project."
                nextStep="Step 7 will add milestone CRUD, validation, and project associations in this section."
              />
            ),
          },
        ],
      },
    ],
  },
  // Estimator boundary — redirects to the standalone estimator app
  { path: '/estimator', Component: EstimatorBoundary },
]);
