import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  fetchSalesCrmSnapshot,
  type SalesCrmSnapshot,
} from './salesCrmApi';

interface SalesCrmContextValue extends SalesCrmSnapshot {
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const EMPTY_SNAPSHOT: SalesCrmSnapshot = {
  accounts: [],
  contacts: [],
  deals: [],
  pipelines: [],
};

const SalesCrmContext = createContext<SalesCrmContextValue | undefined>(undefined);

export function SalesCrmProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<SalesCrmSnapshot>(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshData() {
    setIsRefreshing(true);

    try {
      const nextSnapshot = await fetchSalesCrmSnapshot();
      setSnapshot(nextSnapshot);
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'We could not load the sales CRM data.';
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
    <SalesCrmContext.Provider
      value={{
        ...snapshot,
        loading,
        isRefreshing,
        error,
        refreshData,
      }}
    >
      {children}
    </SalesCrmContext.Provider>
  );
}

export function useSalesCrm() {
  const context = useContext(SalesCrmContext);

  if (!context) {
    throw new Error('useSalesCrm must be used within a SalesCrmProvider.');
  }

  return context;
}
