import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

function getRequiredEnvVar(name: string, value: string | boolean | undefined): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const isProductionBuild = import.meta.env.PROD;

// Prefer explicit local/cloud keys; fallback to legacy names to avoid breaking existing setups.
const supabaseUrl = getRequiredEnvVar(
  isProductionBuild ? 'VITE_SUPABASE_URL_CLOUD' : 'VITE_SUPABASE_URL_LOCAL',
  isProductionBuild
    ? import.meta.env.VITE_SUPABASE_URL_CLOUD ?? import.meta.env.VITE_SUPABASE_URL
    : import.meta.env.VITE_SUPABASE_URL_LOCAL ?? import.meta.env.VITE_SUPABASE_URL,
);

const supabaseAnonKey = getRequiredEnvVar(
  isProductionBuild ? 'VITE_SUPABASE_ANON_KEY_CLOUD' : 'VITE_SUPABASE_ANON_KEY_LOCAL',
  isProductionBuild
    ? import.meta.env.VITE_SUPABASE_ANON_KEY_CLOUD ?? import.meta.env.VITE_SUPABASE_ANON_KEY
    : import.meta.env.VITE_SUPABASE_ANON_KEY_LOCAL ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
);
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
