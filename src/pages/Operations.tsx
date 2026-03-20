import React, { useState, useMemo } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  ChevronRight,
} from 'lucide-react';
import { useTasksStore } from '../stores/tasksStore';
import { TaskList } from '../components/operations/TaskList';
import { TaskDetail } from '../components/operations/TaskDetail';
import { NewTaskModal } from '../components/operations/NewTaskModal';
import { SlidePanel } from '../components/common/SlidePanel';
import type { Task } from '../types';

// ─── Category filter config ───────────────────────────────────────────────────

const CATEGORY_FILTERS: { value: string; label: string; color: string }[] = [
  { value: 'all',           label: 'All',          color: '' },
  { value: 'maintenance',   label: 'Maintenance',   color: 'text-orange-700' },
  { value: 'housekeeping',  label: 'Housekeeping',  color: 'text-violet-700' },
  { value: 'front_desk',    label: 'Front Desk',    color: 'text-blue-700' },
  { value: 'food_beverage', label: 'F&B',           color: 'text-pink-700' },
  { value: 'concierge',     label: 'Concierge',     color: 'text-teal-700' },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function isOverdue(task: Task): boolean {
  if (task.status === 'done') return false;
  if (!task.dueDateTime) return false;
  return new Date(task.dueDateTime) < new Date();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const Operations: React.FC = () => {
  const { tasks, selectedTaskId, selectTask, addTask } = useTasksStore();
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const open        = tasks.filter((t) => t.status !== 'done').length;
    const overdue     = tasks.filter(isOverdue).length;
    const doneToday   = tasks.filter((t) => t.status === 'done' && t.completedAt && isToday(t.completedAt)).length;
    const inProgress  = tasks.filter((t) => t.status === 'in_progress').length;
    return { open, overdue, doneToday, inProgress };
  }, [tasks]);

  const handleSelectTask = (id: string) => {
    selectTask(id);
    setPanelOpen(true);
  };

  const handleAddTask = (task: Task) => {
    addTask(task);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200">
        {/* Title row */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800">Operations</h2>
            <span className="text-xs text-slate-400">Today · Kanban view</span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <div className="flex items-stretch gap-0 border-t border-slate-100 divide-x divide-slate-100">
          {/* Open */}
          <div className="flex items-center gap-3 px-6 py-3 flex-1 min-w-0">
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <ListTodo size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">{stats.open}</p>
              <p className="text-xs text-slate-500 mt-0.5">Open tasks</p>
            </div>
          </div>

          {/* Overdue */}
          <div className={`flex items-center gap-3 px-6 py-3 flex-1 min-w-0 ${stats.overdue > 0 ? 'bg-red-50/60' : ''}`}>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stats.overdue > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
              <AlertTriangle size={16} className={stats.overdue > 0 ? 'text-red-600' : 'text-slate-400'} />
            </div>
            <div>
              <p className={`text-xl font-bold leading-none ${stats.overdue > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {stats.overdue}
              </p>
              <p className={`text-xs mt-0.5 ${stats.overdue > 0 ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                Overdue
              </p>
            </div>
            {stats.overdue > 0 && (
              <span className="ml-2 hidden sm:flex items-center gap-1 text-xs text-red-600 font-medium">
                <ChevronRight size={12} />
                Needs attention
              </span>
            )}
          </div>

          {/* In Progress */}
          <div className="flex items-center gap-3 px-6 py-3 flex-1 min-w-0">
            <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">{stats.inProgress}</p>
              <p className="text-xs text-slate-500 mt-0.5">In progress</p>
            </div>
          </div>

          {/* Completed today */}
          <div className="flex items-center gap-3 px-6 py-3 flex-1 min-w-0">
            <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 leading-none">{stats.doneToday}</p>
              <p className="text-xs text-slate-500 mt-0.5">Completed today</p>
            </div>
          </div>
        </div>

        {/* ── Category filter chips ─────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex-shrink-0">Filter:</span>
          {CATEGORY_FILTERS.map((f) => {
            const isActive = categoryFilter === f.value;
            const count = f.value === 'all'
              ? tasks.length
              : tasks.filter((t) => t.category === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
                <span className={`text-xs font-bold rounded-full px-1 ${isActive ? 'bg-blue-500 text-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KANBAN BOARD ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto min-h-0 lg:min-h-0">
        <TaskList
          tasks={tasks}
          onSelectTask={handleSelectTask}
          onNewTask={() => setModalOpen(true)}
          categoryFilter={categoryFilter}
        />
      </div>

      {/* ── TASK DETAIL SLIDE PANEL ───────────────────────────────────────── */}
      <SlidePanel
        isOpen={panelOpen && !!selectedTask}
        onClose={() => { setPanelOpen(false); selectTask(null); }}
        title="Task Details"
        width="md"
      >
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => { setPanelOpen(false); selectTask(null); }}
          />
        )}
      </SlidePanel>

      {/* ── NEW TASK MODAL ────────────────────────────────────────────────── */}
      <NewTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
};
