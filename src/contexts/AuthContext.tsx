import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

export type UserRole = 'admin' | 'client';

const PROFILE_SYNC_RETRY_MS = 250;
const PROFILE_SYNC_MAX_ATTEMPTS = 3;

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

function getFallbackRole(user: User | null | undefined): UserRole {
  const metadataRole = user?.app_metadata?.role ?? user?.user_metadata?.role;
  return metadataRole === 'admin' ? 'admin' : 'client';
}

async function fetchRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Unable to load profile role; falling back to the auth session.', error);
    return null;
  }

  if (!data) return null;
  return data.role === 'admin' ? 'admin' : 'client';
}

async function resolveRole(user: User): Promise<UserRole> {
  const fallbackRole = getFallbackRole(user);

  for (let attempt = 0; attempt < PROFILE_SYNC_MAX_ATTEMPTS; attempt += 1) {
    const profileRole = await fetchRole(user.id);
    if (profileRole) return profileRole;

    if (attempt < PROFILE_SYNC_MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, PROFILE_SYNC_RETRY_MS);
      });
    }
  }

  return fallbackRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('client');
  const currentUserIdRef = useRef<string | null>(null);
  const roleRequestIdRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    const syncSessionState = async (nextSession: Session | null, showLoading: boolean) => {
      const requestId = ++roleRequestIdRef.current;
      const nextUser = nextSession?.user ?? null;

      currentUserIdRef.current = nextUser?.id ?? null;
      setSession(nextSession);

      if (!nextUser) {
        if (!isActive || requestId !== roleRequestIdRef.current) return;
        setRole('client');
        setLoading(false);
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      const nextRole = await resolveRole(nextUser);

      if (
        !isActive ||
        requestId !== roleRequestIdRef.current ||
        currentUserIdRef.current !== nextUser.id
      ) {
        return;
      }

      setRole(nextRole);
      setLoading(false);
    };

    const initializeAuth = async () => {
      try {
        const { data: { session: initial } } = await supabase.auth.getSession();
        if (!isActive) return;
        await syncSessionState(initial, true);
      } catch (error) {
        console.error('Failed to initialize auth session.', error);
        if (!isActive) return;
        setSession(null);
        setRole('client');
        setLoading(false);
      }
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        const shouldBlockOnRoleLookup =
          currentUserIdRef.current !== (newSession?.user?.id ?? null);

        void syncSessionState(newSession, shouldBlockOnRoleLookup);
      },
    );

    return () => {
      isActive = false;
      roleRequestIdRef.current += 1;
      subscription.unsubscribe();
    };
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
