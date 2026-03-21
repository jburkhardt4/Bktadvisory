import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

function getRequiredEnvVar(name: string, value: string | boolean | undefined): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = getRequiredEnvVar(
  'VITE_SUPABASE_URL',
  import.meta.env.VITE_SUPABASE_URL,
);

const supabaseAnonKey = getRequiredEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
