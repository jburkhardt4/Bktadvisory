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
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
