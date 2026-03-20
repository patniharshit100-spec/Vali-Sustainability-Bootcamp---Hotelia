import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, DoorOpen, Tag, Calendar, MessageCircle,
  Sparkles, ExternalLink, CalendarClock, Pencil,
  AlertTriangle, ArrowUp, Minus, ArrowDown,
} from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import { useTasksStore } from '../../stores/tasksStore';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  housekeeping:  'Housekeeping',
  maintenance:   'Maintenance',
  front_desk:    'Front Desk',
  food_beverage: 'Food & Beverage',
  concierge:     'Concierge',
};

const CATEGORY_PILL: Record<string, string> = {
  housekeeping:  'bg-violet-100 text-violet-700',
  maintenance:   'bg-orange-100 text-orange-700',
  front_desk:    'bg-blue-100 text-blue-700',
  food_beverage: 'bg-pink-100 text-pink-700',
  concierge:     'bg-teal-100 text-teal-700',
};

const PRIORITY_CONFIG: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
  urgent: { cls: 'bg-red-100 text-red-700',    icon: <AlertTriangle size={13} />, label: 'Urgent' },
  high:   { cls: 'bg-amber-100 text-amber-700', icon: <ArrowUp size={13} />,       label: 'High' },
  medium: { cls: 'bg-sky-100 text-sky-700',     icon: <Minus size={13} />,         label: 'Medium' },
  low:    { cls: 'bg-slate-100 text-slate-500',  icon: <ArrowDown size={13} />,     label: 'Low' },
};

const SOURCE_CONFIG: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  manual:        { icon: <Pencil size={12} />,        label: 'Created manually',       cls: 'bg-slate-100 text-slate-600' },
  scheduled:     { icon: <CalendarClock size={12} />, label: 'Scheduled task',         cls: 'bg-blue-50 text-blue-700' },
  guest_request: { icon: <MessageCircle size={12} />, label: 'From guest request',     cls: 'bg-purple-50 text-purple-700' },
  auto_ai:       { icon: <Sparkles size={12} />,      label: 'Auto-created by AI',     cls: 'bg-purple-50 text-purple-700' },
};

const STATUS_TRANSITIONS: Record<TaskStatus, { label: string; next: TaskStatus; cls: string } | null> = {
  todo:        { label: 'Start Task',     next: 'in_progress', cls: 'bg-amber-600 hover:bg-amber-700 text-white' },
  in_progress: { label: 'Mark Complete', next: 'done',        cls: 'bg-green-600 hover:bg-green-700 text-white' },
  done: null,
};

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const navigate = useNavigate();
  const { updateTaskStatus } = useTasksStore();
  const transition = STATUS_TRANSITIONS[task.status];
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const source = SOURCE_CONFIG[task.source ?? 'manual'];

  const overdueCheck = task.status !== 'done' && task.dueDateTime && new Date(task.dueDateTime) < new Date();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Auto-created banner */}
        {task.isAutoCreated && (
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <Sparkles size={14} className="text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-purple-800">Auto-created from guest message</p>
              <p className="text-xs text-purple-600">The AI detected a maintenance issue and created this task automatically.</p>
            </div>
          </div>
        )}

        {/* Title + description */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-800 flex-1 leading-snug">{task.title}</h3>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${priority.cls}`}>
              {priority.icon}
              {priority.label}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
        </div>

        {/* Metadata */}
        <div className="bg-slate-50 rounded-xl px-4 divide-y divide-slate-100">
          <Row icon={<Tag size={14} />} label="Category">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_PILL[task.category]}`}>
              {CATEGORY_LABELS[task.category]}
            </span>
          </Row>

          <Row icon={<Avatar name={task.assignedTo} size="xs" />} label="Assigned to">
            <span className="font-medium">{task.assignedTo}</span>
          </Row>

          {task.roomNumber && (
            <Row icon={<DoorOpen size={14} />} label="Room">
              Room {task.roomNumber}
            </Row>
          )}

          {task.dueTime && (
            <Row icon={<Clock size={14} />} label="Due time">
              <span className={overdueCheck ? 'text-red-600 font-semibold' : ''}>
                {overdueCheck && '⚠ Overdue · '}
                {task.dueTime}
              </span>
            </Row>
          )}

          <Row icon={<Calendar size={14} />} label="Created">
            {new Date(task.createdAt).toLocaleString([], {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </Row>

          {task.completedAt && (
            <Row icon={<Calendar size={14} />} label="Completed">
              {new Date(task.completedAt).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Row>
          )}

          <Row icon={<span className="text-slate-400">{source.icon}</span>} label="Source">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${source.cls}`}>
              {source.icon}
              {source.label}
            </span>
          </Row>

          {task.sourceConversationId && (
            <Row icon={<MessageCircle size={14} />} label="Guest conversation">
              <button
                onClick={() => { onClose(); navigate('/conversations'); }}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
              >
                View conversation
                <ExternalLink size={12} />
              </button>
            </Row>
          )}
        </div>

        {/* Status action */}
        {transition && (
          <button
            onClick={() => {
              updateTaskStatus(task.id, transition.next);
              onClose();
            }}
            className={`w-full py-2.5 text-sm font-bold rounded-xl transition-colors ${transition.cls}`}
          >
            {transition.label}
          </button>
        )}

        {task.status === 'done' && (
          <div className="flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-xl">
            <span className="text-green-600 text-sm font-semibold">Task completed</span>
          </div>
        )}
      </div>
    </div>
  );
};
