import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  DoorOpen,
  Calendar,
  Sparkles,
  MessageCircle,
  CalendarClock,
  Pencil,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import type { Task } from '../../types';
import { Avatar } from '../common/Avatar';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_BADGE: Record<string, { cls: string; label: string }> = {
  urgent: { cls: 'bg-red-100 text-red-700 border border-red-200', label: 'Urgent' },
  high:   { cls: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'High' },
  medium: { cls: 'bg-sky-100 text-sky-700 border border-sky-200', label: 'Medium' },
  low:    { cls: 'bg-slate-100 text-slate-500 border border-slate-200', label: 'Low' },
};

const PRIORITY_LEFT: Record<string, string> = {
  urgent: 'border-l-red-500',
  high:   'border-l-amber-400',
  medium: 'border-l-sky-400',
  low:    'border-l-slate-300',
};

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_PILL: Record<string, string> = {
  housekeeping: 'bg-violet-50 text-violet-700',
  maintenance:  'bg-orange-50 text-orange-700',
  front_desk:   'bg-blue-50 text-blue-700',
  food_beverage:'bg-pink-50 text-pink-700',
  concierge:    'bg-teal-50 text-teal-700',
};

const CATEGORY_LABEL: Record<string, string> = {
  housekeeping:  'Housekeeping',
  maintenance:   'Maintenance',
  front_desk:    'Front Desk',
  food_beverage: 'F&B',
  concierge:     'Concierge',
};

// ─── Source config ────────────────────────────────────────────────────────────

const SOURCE_CONFIG: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
  manual:        { icon: <Pencil size={10} />,        label: 'Manual',        cls: 'bg-slate-100 text-slate-500' },
  scheduled:     { icon: <CalendarClock size={10} />, label: 'Scheduled',     cls: 'bg-blue-50 text-blue-600' },
  guest_request: { icon: <MessageCircle size={10} />, label: 'Guest Request', cls: 'bg-purple-50 text-purple-700' },
  auto_ai:       { icon: <Sparkles size={10} />,      label: 'Guest Request', cls: 'bg-purple-50 text-purple-700' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isOverdue(task: Task): boolean {
  if (task.status === 'done') return false;
  if (!task.dueDateTime) return false;
  return new Date(task.dueDateTime) < new Date();
}

// ─── Component ────────────────────────────────────────────────────────────────

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const navigate = useNavigate();
  const overdue = isOverdue(task);
  const priority = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;
  const leftBorder = PRIORITY_LEFT[task.priority] ?? PRIORITY_LEFT.medium;
  const source = SOURCE_CONFIG[task.source ?? 'manual'];

  const handleConvLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/conversations');
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-l-4 ${leftBorder} cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 select-none ${
        overdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
      }`}
    >
      {/* ── Auto-created banner ─────────────────────────────────────────── */}
      {task.isAutoCreated && (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border-b border-purple-100 rounded-t-xl">
          <Sparkles size={12} className="text-purple-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-purple-700">Auto-created from guest message</span>
          {task.sourceConversationId && (
            <button
              onClick={handleConvLink}
              className="ml-auto flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              View message
              <ExternalLink size={10} />
            </button>
          )}
        </div>
      )}

      <div className="p-4">
        {/* ── Row 1: source pill + priority badge ──────────────────────── */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${source.cls}`}>
            {source.icon}
            {source.label}
          </span>
          {task.sourceConversationId && !task.isAutoCreated && (
            <button
              onClick={handleConvLink}
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
              title="View conversation"
            >
              <ExternalLink size={11} />
            </button>
          )}
          <span className={`ml-auto inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${priority.cls}`}>
            {task.priority === 'urgent' && <AlertTriangle size={10} />}
            {priority.label}
          </span>
        </div>

        {/* ── Title + description ───────────────────────────────────────── */}
        <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">{task.title}</p>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{task.description}</p>

        {/* ── Meta row 1: category + room + due ────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_PILL[task.category]}`}>
            {CATEGORY_LABEL[task.category]}
          </span>
          {task.roomNumber && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <DoorOpen size={11} />
              Room {task.roomNumber}
            </span>
          )}
          {task.dueTime && (
            <span className={`flex items-center gap-1 text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
              <Clock size={11} className={overdue ? 'text-red-500' : 'text-slate-400'} />
              {overdue && 'Overdue · '}
              Due {task.dueTime}
            </span>
          )}
        </div>

        {/* ── Meta row 2: assignee + created ───────────────────────────── */}
        <div className="flex items-center gap-2">
          <Avatar name={task.assignedTo} size="xs" />
          <span className="text-xs text-slate-600 font-medium">{task.assignedTo}</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={10} />
            {relativeTime(task.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
