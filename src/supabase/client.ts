import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

function getRequiredEnvVar(name: string, value: string | boolean | undefined): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSupabaseProjectRef(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const projectRef = hostname.split('.')[0];
    if (!projectRef) {
      throw new Error('Unable to determine Supabase project ref from URL.');
    }
    return projectRef;
  } catch {
    throw new Error(`Invalid Supabase URL: ${url}`);
  }
}

const isProductionBuild = import.meta.env.PROD;

// Prefer explicit local/cloud keys; fallback to legacy names to avoid breaking existing setups.
export const supabaseUrl = getRequiredEnvVar(
  isProductionBuild ? 'VITE_SUPABASE_URL_CLOUD' : 'VITE_SUPABASE_URL_LOCAL',
  isProductionBuild
    ? import.meta.env.VITE_SUPABASE_URL_CLOUD ?? import.meta.env.VITE_SUPABASE_URL
    : import.meta.env.VITE_SUPABASE_URL_LOCAL ?? import.meta.env.VITE_SUPABASE_URL,
);

export const supabaseAnonKey = getRequiredEnvVar(
  isProductionBuild ? 'VITE_SUPABASE_ANON_KEY_CLOUD' : 'VITE_SUPABASE_ANON_KEY_LOCAL',
  isProductionBuild
    ? import.meta.env.VITE_SUPABASE_ANON_KEY_CLOUD ?? import.meta.env.VITE_SUPABASE_ANON_KEY
    : import.meta.env.VITE_SUPABASE_ANON_KEY_LOCAL ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const supabaseProjectRef = getSupabaseProjectRef(supabaseUrl);
export const supabaseAuthStorageKey = `sb-${supabaseProjectRef}-auth-token`;

const LEGACY_AUTH_STORAGE_KEYS = ['supabase.auth.token'];

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: supabaseAuthStorageKey,
  },
});

function removeStoredKeys(storage: Storage): void {
  const keysToRemove: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;

    const isCurrentProjectKey =
      key === supabaseAuthStorageKey ||
      key === `${supabaseAuthStorageKey}-code-verifier` ||
      key.startsWith(`sb-${supabaseProjectRef}-`);

    if (isCurrentProjectKey || LEGACY_AUTH_STORAGE_KEYS.includes(key)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    storage.removeItem(key);
  }
}

export function clearStoredSupabaseSession(): void {
  if (typeof window === 'undefined') return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      removeStoredKeys(storage);
    } catch {
      // Ignore storage access issues so sign-out still completes.
    }
  }
}

export function getSupabaseFunctionUrl(functionName: string): string {
  return `${supabaseUrl}/functions/v1/${functionName}`;
}
