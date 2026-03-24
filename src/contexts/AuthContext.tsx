import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@jsr/supabase__supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'admin' | 'client';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  role: UserRole;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  role: 'client',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session once on mount
    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      setSession(initial);
      setLoading(false);
    });

    // Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const role: UserRole = session?.user?.user_metadata?.role === 'admin' ? 'admin' : 'client';

  return (
    <AuthContext.Provider value={{ session, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
