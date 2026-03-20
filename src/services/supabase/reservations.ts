import { supabase } from '../../lib/supabase';
import type { Reservation, ReservationStatus } from '../../types';

export async function fetchReservations(): Promise<Reservation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('check_in', { ascending: true });
  if (error) { console.error('[supabase] fetchReservations:', error.message); return []; }
  return (data as Reservation[]) ?? [];
}

export async function createReservation(res: Omit<Reservation, 'id'>): Promise<Reservation | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('reservations').insert(res).select().single();
  if (error) { console.error('[supabase] createReservation:', error.message); return null; }
  return data as Reservation;
}

export async function updateReservation(id: string, patch: Partial<Reservation>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('reservations').update(patch).eq('id', id);
  if (error) console.error('[supabase] updateReservation:', error.message);
}

export async function cancelReservation(id: string): Promise<void> {
  return updateReservation(id, { status: 'cancelled' as ReservationStatus });
}

export function subscribeToReservations(
  callback: (event: 'INSERT' | 'UPDATE' | 'DELETE', res: Reservation) => void,
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('reservations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, (payload) => {
      const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
      const res = (payload.new ?? payload.old) as Reservation;
      callback(event, res);
    })
    .subscribe();
  return () => { void supabase?.removeChannel(channel); };
}
