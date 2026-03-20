import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_SUPABASE_URL ?? '';
const supabaseKey = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConfigured = () => supabase !== null;
