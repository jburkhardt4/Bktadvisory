import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { session, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bkt-loading-screen">
        <div className="bkt-loading-spinner animate-spin" />
      </div>
    );
  }

  const from = `${location.pathname}${location.search}${location.hash}`;

  if (!session) {
    return <Navigate to="/auth" replace state={{ from }} />;
  }

  if (role !== 'admin') {
    return <Navigate to="/portal" replace state={{ from }} />;
  }

  return <>{children}</>;
}
