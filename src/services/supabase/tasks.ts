import { supabase } from '../../lib/supabase';
import type { Task, TaskStatus } from '../../types';

export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[supabase] fetchTasks:', error.message); return []; }
  return (data as Task[]) ?? [];
}

export async function createTask(task: Omit<Task, 'id'>): Promise<Task | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) { console.error('[supabase] createTask:', error.message); return null; }
  return data as Task;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('tasks').update(patch).eq('id', id);
  if (error) console.error('[supabase] updateTask:', error.message);
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) console.error('[supabase] deleteTask:', error.message);
}

export function subscribeToTasks(
  callback: (event: 'INSERT' | 'UPDATE' | 'DELETE', task: Task) => void,
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
      const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
      const task = (payload.new ?? payload.old) as Task;
      callback(event, task);
    })
    .subscribe();
  return () => { void supabase?.removeChannel(channel); };
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const patch: Partial<Task> = { status };
  if (status === 'done') patch.completedAt = new Date().toISOString();
  return updateTask(id, patch);
}
