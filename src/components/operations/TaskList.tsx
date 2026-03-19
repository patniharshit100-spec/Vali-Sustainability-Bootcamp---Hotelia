import React from 'react';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface Column {
  id: TaskStatus;
  label: string;
  color: string;
}

const columns: Column[] = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
];

interface TaskListProps {
  tasks: Task[];
  onSelectTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onSelectTask }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <span className="ml-auto bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {colTasks.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center">
                  <p className="text-xs text-slate-400">No tasks</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
