import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  fetchAdminCrmSnapshot,
  type AdminCrmSnapshot,
} from './adminCrmApi';

interface AdminCrmContextValue extends AdminCrmSnapshot {
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const EMPTY_SNAPSHOT: AdminCrmSnapshot = {
  profiles: [],
  quotes: [],
  projects: [],
  activities: [],
  milestones: [],
  opportunities: [],
};

const AdminCrmContext = createContext<AdminCrmContextValue | undefined>(undefined);

export function AdminCrmProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AdminCrmSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshData() {
    setIsRefreshing(true);

    try {
      const nextSnapshot = await fetchAdminCrmSnapshot();
      setSnapshot(nextSnapshot);
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'We could not load the admin CRM data.';
      setError(message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  return (
    <AdminCrmContext.Provider
      value={{
        ...snapshot,
        loading,
        isRefreshing,
        error,
        refreshData,
      }}
    >
      {children}
    </AdminCrmContext.Provider>
  );
}

export function useAdminCrm() {
  const context = useContext(AdminCrmContext);

  if (!context) {
    throw new Error('useAdminCrm must be used within an AdminCrmProvider.');
  }

  return context;
}
