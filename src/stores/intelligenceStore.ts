import { create } from 'zustand';
import type { KPI, Competitor, Review } from '../types';
import { mockKPIs, mockCompetitors, mockReviews } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Insight {
  id: string;
  text: string;
  category: 'pricing' | 'operations' | 'review-alert' | 'daily-briefing';
  actionType?: string;
  actionId?: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
}

interface IntelligenceState {
  kpis: KPI[];
  competitors: Competitor[];
  reviews: Review[];
  insights: Insight[];
  loading: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  markInsightRead: (id: string) => Promise<void>;
  cleanup: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildKPIs(
  occupancyRate: number,
  adr: number,
  avgReview: number,
  pendingActions: number,
): KPI[] {
  return [
    {
      id: 'occupancy',
      label: 'Occupancy',
      value: `${Math.round(occupancyRate)}%`,
      change: 0,
      changeLabel: 'Live',
      trend: occupancyRate >= 75 ? 'up' : occupancyRate >= 50 ? 'flat' : 'down',
    },
    {
      id: 'adr',
      label: 'Avg Daily Rate',
      value: `€${Math.round(adr)}`,
      change: 0,
      changeLabel: 'Live',
      trend: 'flat',
    },
    {
      id: 'avg-review',
      label: 'Avg Review',
      value: avgReview.toFixed(1),
      change: 0,
      changeLabel: 'Live',
      trend: avgReview >= 4 ? 'up' : avgReview >= 3 ? 'flat' : 'down',
    },
    {
      id: 'pending-actions',
      label: 'Pending Actions',
      value: String(pendingActions),
      change: 0,
      changeLabel: 'Live',
      trend: pendingActions === 0 ? 'flat' : 'down',
    },
  ];
}

async function fetchKPIsFromSupabase(): Promise<KPI[]> {
  if (!supabase) return mockKPIs;

  const [roomsRes, reservationsRes, reviewsRes, messagesRes] = await Promise.all([
    supabase.from('rooms').select('status'),
    supabase
      .from('reservations')
      .select('total_price')
      .in('status', ['confirmed', 'checked-in']),
    supabase.from('reviews').select('rating'),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('status', ['unread', 'ai-reply-ready']),
  ]);

  const rooms = (roomsRes.data ?? []) as { status: string }[];
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  const reservations = (reservationsRes.data ?? []) as { total_price: number | null }[];
  const prices = reservations.map((r) => r.total_price ?? 0).filter((p) => p > 0);
  const adr = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const reviews = (reviewsRes.data ?? []) as { rating: number }[];
  const ratings = reviews.map((r) => r.rating).filter((r) => r > 0);
  const avgReview = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const pendingActions = messagesRes.count ?? 0;

  return buildKPIs(occupancyRate, adr, avgReview, pendingActions);
}

async function fetchCompetitorsFromSupabase(): Promise<Competitor[]> {
  if (!supabase) return mockCompetitors;
  const { data, error } = await supabase.from('competitors').select('*');
  if (error) {
    console.error('[supabase] fetchCompetitors:', error.message);
    return mockCompetitors;
  }
  // Map DB snake_case → app camelCase
  return (data ?? []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    name: c.hotel_name as string,
    stars: 4, // not stored in DB — default
    avgRate: ((c.standard_price as number ?? 0) + (c.superieure_price as number ?? 0)) / 2,
    occupancy: 0,
    reviewScore: c.rating as number ?? 0,
  }));
}

async function fetchInsightsFromSupabase(): Promise<Insight[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    console.error('[supabase] fetchInsights:', error.message);
    return [];
  }
  return (data ?? []).map((i: Record<string, unknown>) => ({
    id: i.id as string,
    text: i.text as string,
    category: i.category as Insight['category'],
    actionType: i.action_type as string | undefined,
    actionId: i.action_id as string | undefined,
    priority: (i.priority as Insight['priority']) ?? 'medium',
    isRead: (i.is_read as boolean) ?? false,
    createdAt: i.created_at as string,
  }));
}

// ─── Realtime subscription cleanup ─────────────────────────────────────────

let _unsubscribeInsights: (() => void) | null = null;

// ─── Store ─────────────────────────────────────────────────────────────────

export const useIntelligenceStore = create<IntelligenceState>((set, get) => {
  // Bootstrap on store creation
  void (async () => {
    if (isSupabaseConfigured()) {
      set({ loading: true, error: null });
      const [kpis, competitors, insights] = await Promise.all([
        fetchKPIsFromSupabase(),
        fetchCompetitorsFromSupabase(),
        fetchInsightsFromSupabase(),
      ]);
      set({ kpis, competitors, insights, loading: false });

      // Subscribe to new insights in real-time
      if (supabase) {
        const channel = supabase
          .channel('insights-changes')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'insights' },
            (payload) => {
              const i = payload.new as Record<string, unknown>;
              const insight: Insight = {
                id: i.id as string,
                text: i.text as string,
                category: i.category as Insight['category'],
                actionType: i.action_type as string | undefined,
                actionId: i.action_id as string | undefined,
                priority: (i.priority as Insight['priority']) ?? 'medium',
                isRead: false,
                createdAt: i.created_at as string,
              };
              set((state) => ({ insights: [insight, ...state.insights] }));
            },
          )
          .subscribe();
        _unsubscribeInsights = () => { void supabase?.removeChannel(channel); };
      }
    } else {
      set({ loading: false });
    }
  })();

  return {
    kpis: mockKPIs,
    competitors: mockCompetitors,
    reviews: mockReviews,
    insights: [],
    loading: isSupabaseConfigured(),
    error: null,

    load: async () => {
      if (!isSupabaseConfigured()) return;
      set({ loading: true, error: null });
      try {
        const [kpis, competitors, insights] = await Promise.all([
          fetchKPIsFromSupabase(),
          fetchCompetitorsFromSupabase(),
          fetchInsightsFromSupabase(),
        ]);
        set({ kpis, competitors, insights, loading: false });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      }
    },

    markInsightRead: async (id) => {
      set((state) => ({
        insights: state.insights.map((i) => (i.id === id ? { ...i, isRead: true } : i)),
      }));
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('insights')
          .update({ is_read: true })
          .eq('id', id);
        if (error) console.error('[supabase] markInsightRead:', error.message);
      }
    },

    cleanup: () => {
      _unsubscribeInsights?.();
      _unsubscribeInsights = null;
    },
  };
});
