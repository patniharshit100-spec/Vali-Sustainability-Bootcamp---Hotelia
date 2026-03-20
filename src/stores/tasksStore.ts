import { create } from 'zustand';
import type { Task, TaskStatus } from '../types';
import { mockTasks } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchTasks,
  createTask as createTaskInDB,
  updateTask,
  subscribeToTasks,
} from '../services/supabase/tasks';

let _unsubscribe: (() => void) | null = null;

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
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

    updateTaskStatus: async (id, status) => {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { ...t, status, completedAt: status === 'done' ? new Date().toISOString() : t.completedAt }
            : t,
        ),
      }));
      // Persist to Supabase
      if (isSupabaseConfigured()) {
        await updateTask(id, {
          status,
          ...(status === 'done' ? { completedAt: new Date().toISOString() } : {}),
        } as Partial<Task>);
      }
    },

    addTask: async (task) => {
      // Optimistic add
      set((state) => ({ tasks: [task, ...state.tasks] }));
      if (isSupabaseConfigured()) {
        const created = await createTaskInDB(task);
        if (created) {
          // Replace temp record with real DB record (has server-generated id)
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === task.id ? created : t)),
          }));
        } else {
          // Roll back on failure
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== task.id) }));
        }
      }
    },

    cleanup: () => {
      _unsubscribe?.();
      _unsubscribe = null;
    },
  };
});
