import { supabase } from '../../lib/supabase';
import type { Message } from '../../types';

export async function fetchMessages(): Promise<Message[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) { console.error('[supabase] fetchMessages:', error.message); return []; }
  return (data as Message[]) ?? [];
}

export async function updateMessage(id: string, patch: Partial<Message>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('messages').update(patch).eq('id', id);
  if (error) console.error('[supabase] updateMessage:', error.message);
}

export async function createMessage(msg: Omit<Message, 'id'>): Promise<Message | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('messages').insert(msg).select().single();
  if (error) { console.error('[supabase] createMessage:', error.message); return null; }
  return data as Message;
}

export function subscribeToMessages(callback: (msg: Message) => void): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('messages-inserts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      callback(payload.new as Message);
    })
    .subscribe();
  return () => { void supabase?.removeChannel(channel); };
}
