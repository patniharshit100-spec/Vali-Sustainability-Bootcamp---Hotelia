import { create } from 'zustand';
import type { Reservation } from '../types';
import { mockReservations } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  subscribeToReservations,
} from '../services/supabase/reservations';

let _unsubscribe: (() => void) | null = null;

interface ReservationState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  selectedReservationId: string | null;

  // Actions
  load: () => Promise<void>;
  selectReservation: (id: string | null) => void;
  addReservation: (data: Omit<Reservation, 'id'>) => Promise<void>;
  updateReservationById: (id: string, patch: Partial<Reservation>) => Promise<void>;
  cancelReservationById: (id: string) => Promise<void>;
  cleanup: () => void;
}

export const useReservationStore = create<ReservationState>((set, get) => {
  // Bootstrap on store creation
  void (async () => {
    if (isSupabaseConfigured()) {
      set({ loading: true, error: null });
      const data = await fetchReservations();
      if (data.length > 0) set({ reservations: data });
      set({ loading: false });

      _unsubscribe = subscribeToReservations((event, reservation) => {
        set((state) => {
          if (event === 'INSERT') return { reservations: [reservation, ...state.reservations] };
          if (event === 'UPDATE') return {
            reservations: state.reservations.map((r) => (r.id === reservation.id ? reservation : r)),
          };
          if (event === 'DELETE') return {
            reservations: state.reservations.filter((r) => r.id !== reservation.id),
          };
          return {};
        });
      });
    } else {
      set({ loading: false });
    }
  })();

  return {
    reservations: mockReservations,
    loading: isSupabaseConfigured(),
    error: null,
    selectedReservationId: null,

    load: async () => {
      if (!isSupabaseConfigured()) return;
      set({ loading: true, error: null });
      try {
        const data = await fetchReservations();
        set({ reservations: data, loading: false });
      } catch (e) {
        set({ error: (e as Error).message, loading: false });
      }
    },

    selectReservation: (id) => set({ selectedReservationId: id }),

    addReservation: async (data) => {
      // Optimistic add with a temp id
      const tempId = `temp-${Date.now()}`;
      const temp = { ...data, id: tempId } as Reservation;
      set((state) => ({ reservations: [temp, ...state.reservations] }));

      if (isSupabaseConfigured()) {
        const created = await createReservation(data);
        if (created) {
          // Replace temp with real record
          set((state) => ({
            reservations: state.reservations.map((r) => (r.id === tempId ? created : r)),
          }));
        } else {
          // Roll back on failure
          set((state) => ({
            reservations: state.reservations.filter((r) => r.id !== tempId),
          }));
        }
      }
    },

    updateReservationById: async (id, patch) => {
      // Optimistic update
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
      if (isSupabaseConfigured()) {
        await updateReservation(id, patch);
      }
    },

    cancelReservationById: async (id) => {
      // Optimistic status change
      set((state) => ({
        reservations: state.reservations.map((r) =>
          r.id === id ? { ...r, status: 'cancelled' as const } : r,
        ),
      }));
      if (isSupabaseConfigured()) {
        await cancelReservation(id);
      }
    },

    cleanup: () => {
      _unsubscribe?.();
      _unsubscribe = null;
    },
  };
});
