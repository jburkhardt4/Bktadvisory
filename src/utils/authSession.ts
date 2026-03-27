import { clearStoredSupabaseSession, supabase } from '../supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/** Retrieves the current Supabase session (null when signed out). */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Subscribes to Supabase auth state changes.
 * Returns the subscription so the caller can unsubscribe on cleanup.
 */
export function onAuthChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/** Signs the current user out. */
export async function clearSession(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } finally {
    clearStoredSupabaseSession();
  }
}
