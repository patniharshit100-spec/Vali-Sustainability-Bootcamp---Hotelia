import { create } from 'zustand';
import type { Task, TaskStatus } from '../types';
import { mockTasks } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchTasks, subscribeToTasks } from '../services/supabase/tasks';

let _unsubscribe: (() => void) | null = null;

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (task: Task) => void;
  cleanup: () => void;
}

export const useTasksStore = create<TasksState>((set) => {
  void (async () => {
    if (isSupabaseConfigured()) {
      set({ loading: true, error: null });
      const data = await fetchTasks();
      if (data.length > 0) set({ tasks: data });
      set({ loading: false });
      _unsubscribe = subscribeToTasks((event, task) => {
        set((state) => {
          if (event === 'INSERT') return { tasks: [task, ...state.tasks] };
          if (event === 'UPDATE') return { tasks: state.tasks.map((t) => (t.id === task.id ? task : t)) };
          if (event === 'DELETE') return { tasks: state.tasks.filter((t) => t.id !== task.id) };
          return {};
        });
      });
    } else {
      set({ loading: false });
    }
  })();

  return {
    tasks: mockTasks,
    loading: isSupabaseConfigured(),
    error: null,
    selectedTaskId: null,
    selectTask: (id) => set({ selectedTaskId: id }),
    updateTaskStatus: (id, status) =>
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : t.completedAt }
            : t,
        ),
      })),
    addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
    cleanup: () => { _unsubscribe?.(); _unsubscribe = null; },
  };
});
