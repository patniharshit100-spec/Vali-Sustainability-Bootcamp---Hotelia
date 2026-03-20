import { create } from 'zustand';
import type { Task, TaskStatus } from '../types';
import { mockTasks } from '../data/mockData';

interface TasksState {
  tasks: Task[];
  selectedTaskId: string | null;
  selectTask: (id: string | null) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (task: Task) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: mockTasks,
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
  addTask: (task) =>
    set((state) => ({ tasks: [task, ...state.tasks] })),
}));
