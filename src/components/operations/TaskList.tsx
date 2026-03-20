import React from 'react';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface Column {
  id: TaskStatus;
  label: string;
  dot: string;
  bg: string;
  emptyText: string;
}

const COLUMNS: Column[] = [
  { id: 'todo',        label: 'To Do',       dot: 'bg-slate-400',  bg: 'bg-slate-50/60',   emptyText: 'No tasks to do' },
  { id: 'in_progress', label: 'In Progress', dot: 'bg-amber-500',  bg: 'bg-amber-50/40',   emptyText: 'Nothing in progress' },
  { id: 'done',        label: 'Done',        dot: 'bg-green-500',  bg: 'bg-green-50/40',   emptyText: 'No completed tasks' },
];

interface TaskListProps {
  tasks: Task[];
  onSelectTask: (id: string) => void;
  onNewTask?: () => void;
  categoryFilter?: string;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onSelectTask, onNewTask, categoryFilter }) => {
  const filtered = categoryFilter && categoryFilter !== 'all'
    ? tasks.filter((t) => t.category === categoryFilter)
    : tasks;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 lg:h-full">
      {COLUMNS.map((col) => {
        const colTasks = filtered.filter((t) => t.status === col.id);
        const urgentCount = colTasks.filter((t) => t.priority === 'urgent').length;

        return (
          <div key={col.id} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 ${col.bg}`}>
              <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${col.dot}`} />
              <h3 className="text-sm font-bold text-slate-700">{col.label}</h3>
              <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full ml-0.5">
                {colTasks.length}
              </span>
              {urgentCount > 0 && col.id !== 'done' && (
                <span className="text-xs bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded-full">
                  {urgentCount} urgent
                </span>
              )}
              {/* Add button only on To Do column */}
              {col.id === 'todo' && onNewTask && (
                <button
                  onClick={onNewTask}
                  className="ml-auto p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                  title="New task"
                >
                  <Plus size={15} />
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 lg:overflow-y-auto space-y-3 pb-2 pr-0.5">
              {colTasks.length === 0 ? (
                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors group"
                  onClick={col.id === 'todo' ? onNewTask : undefined}
                >
                  <p className="text-xs text-slate-400 group-hover:text-slate-500">{col.emptyText}</p>
                  {col.id === 'todo' && (
                    <p className="text-xs text-slate-300 group-hover:text-blue-500 flex items-center gap-1">
                      <Plus size={11} />
                      Add task
                    </p>
                  )}
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
