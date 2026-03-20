import { supabase } from '../../lib/supabase';
import type { KPI, Competitor } from '../../types';

export async function fetchKPIs(): Promise<KPI[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('kpis').select('*');
  if (error) { console.error('[supabase] fetchKPIs:', error.message); return []; }
  return (data as KPI[]) ?? [];
}

export async function fetchCompetitors(): Promise<Competitor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .order('review_score', { ascending: false });
  if (error) { console.error('[supabase] fetchCompetitors:', error.message); return []; }
  return (data as Competitor[]) ?? [];
}

export async function fetchInsights(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('insights')
    .select('text')
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) { console.error('[supabase] fetchInsights:', error.message); return []; }
  return (data as { text: string }[]).map((r) => r.text);
}

export async function fetchForecasts(): Promise<Record<string, unknown>[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('forecasts').select('*');
  if (error) { console.error('[supabase] fetchForecasts:', error.message); return []; }
  return (data as Record<string, unknown>[]) ?? [];
}
