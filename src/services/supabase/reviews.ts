import { supabase } from '../../lib/supabase';
import type { Review } from '../../types';

export async function fetchReviews(): Promise<Review[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('date', { ascending: false });
  if (error) { console.error('[supabase] fetchReviews:', error.message); return []; }
  return (data as Review[]) ?? [];
}

export async function updateReview(id: string, patch: Partial<Review>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('reviews').update(patch).eq('id', id);
  if (error) console.error('[supabase] updateReview:', error.message);
}

export function subscribeToReviews(callback: (review: Review) => void): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('reviews-inserts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, (payload) => {
      callback(payload.new as Review);
    })
    .subscribe();
  return () => { void supabase?.removeChannel(channel); };
}
