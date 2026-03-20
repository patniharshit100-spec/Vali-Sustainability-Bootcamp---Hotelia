import { supabase } from '../../lib/supabase';
import type { HotelRoom } from '../../data/types';

export async function fetchRooms(): Promise<HotelRoom[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('number', { ascending: true });
  if (error) { console.error('[supabase] fetchRooms:', error.message); return []; }
  return (data as HotelRoom[]) ?? [];
}

export async function updateRoom(id: string, patch: Partial<HotelRoom>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('rooms').update(patch).eq('id', id);
  if (error) console.error('[supabase] updateRoom:', error.message);
}

export function subscribeToRooms(
  callback: (event: 'INSERT' | 'UPDATE' | 'DELETE', room: HotelRoom) => void,
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('rooms-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
      const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
      const room = (payload.new ?? payload.old) as HotelRoom;
      callback(event, room);
    })
    .subscribe();
  return () => { void supabase?.removeChannel(channel); };
}
