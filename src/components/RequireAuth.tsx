import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Route-boundary auth guard.
 * Shows a minimal skeleton while the Supabase session is loading to prevent
 * flash-of-unauthenticated-content, then redirects unauthenticated visitors
 * to /auth while preserving the intended destination in `state.from`.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Capture the full path, search queries, and hash fragments
  const from = `${location.pathname}${location.search}${location.hash}`;

  if (!session) {
    return <Navigate to="/auth" replace state={{ from }} />;
  }
  return <>{children}</>;
}
