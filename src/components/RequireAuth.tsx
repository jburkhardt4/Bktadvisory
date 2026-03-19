import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { isAuthenticated } from '../utils/authSession';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Route-boundary auth guard.
 * Redirects unauthenticated visitors to /auth while preserving the
 * intended destination in `state.from` so the sign-in page can redirect
 * back after a successful login.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();

  // Capture the full path, search queries, and hash fragments
  const from = `${location.pathname}${location.search}${location.hash}`;

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace state={{ from }} />;
  }
  return <>{children}</>;
}
