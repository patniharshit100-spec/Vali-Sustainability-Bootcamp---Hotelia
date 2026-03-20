import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

export type RealtimeStatus = 'connected' | 'reconnecting' | 'disconnected';

interface RealtimeState {
  status: RealtimeStatus;
  lastConnectedAt: Date | null;

  // Actions
  initialize: () => void;
  cleanup: () => void;
}

// ─── Module-level cleanup ──────────────────────────────────────────────────

let _heartbeatUnsubscribe: (() => void) | null = null;

// ─── Store ─────────────────────────────────────────────────────────────────

export const useRealtimeStore = create<RealtimeState>((set) => ({
  status: isSupabaseConfigured() ? 'reconnecting' : 'disconnected',
  lastConnectedAt: null,

  initialize: () => {
    if (!isSupabaseConfigured() || !supabase) {
      set({ status: 'disconnected' });
      return;
    }

    // Create a lightweight heartbeat channel to monitor connection state.
    // The other stores (tasks, inbox, reservations, intelligence) each manage
    // their own data subscriptions — this store only tracks connectivity.
    const channel = supabase
      .channel('__heartbeat__')
      .subscribe((channelStatus) => {
        if (channelStatus === 'SUBSCRIBED') {
          set({ status: 'connected', lastConnectedAt: new Date() });
        } else if (
          channelStatus === 'CHANNEL_ERROR' ||
          channelStatus === 'TIMED_OUT' ||
          channelStatus === 'CLOSED'
        ) {
          set({ status: 'reconnecting' });
        }
      });

    _heartbeatUnsubscribe = () => { void supabase?.removeChannel(channel); };
  },

  cleanup: () => {
    _heartbeatUnsubscribe?.();
    _heartbeatUnsubscribe = null;
    set({ status: 'disconnected' });
  },
}));
