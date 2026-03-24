import { createBrowserRouter } from 'react-router';
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
    element: <RequireAuth><PortalPage /></RequireAuth>,
  },
  // Estimator boundary — redirects to the standalone estimator app
  { path: '/estimator', Component: EstimatorBoundary },
]);