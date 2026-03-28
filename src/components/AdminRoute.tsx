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
      <div className="min-h-screen bg-[#0F172B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
