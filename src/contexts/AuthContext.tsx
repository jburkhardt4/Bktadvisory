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

async function fetchRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return 'client';
  return data.role === 'admin' ? 'admin' : 'client';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('client');

  useEffect(() => {
    // Fetch the initial session once on mount
    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      setSession(initial);
      if (initial?.user) {
        setRole(await fetchRole(initial.user.id));
      }
      setLoading(false);
    });

    // Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setRole(await fetchRole(newSession.user.id));
        } else {
          setRole('client');
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
