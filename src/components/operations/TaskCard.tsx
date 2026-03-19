import React from 'react';
import { Clock, DoorOpen } from 'lucide-react';
import type { Task } from '../../types';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityVariant: Record<string, 'danger' | 'warning' | 'default' | 'info'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const categoryLabels: Record<string, string> = {
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance',
  front_desk: 'Front Desk',
  food_beverage: 'F&B',
  concierge: 'Concierge',
};

const categoryColors: Record<string, string> = {
  housekeeping: 'bg-violet-100 text-violet-700',
  maintenance: 'bg-orange-100 text-orange-700',
  front_desk: 'bg-blue-100 text-blue-700',
  food_beverage: 'bg-pink-100 text-pink-700',
  concierge: 'bg-teal-100 text-teal-700',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
        task.priority === 'urgent'
          ? 'border-red-200 border-l-4 border-l-red-500'
          : task.priority === 'high'
          ? 'border-amber-200 border-l-4 border-l-amber-500'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{task.title}</p>
        <Badge variant={priorityVariant[task.priority]} size="sm">
          {task.priority}
        </Badge>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[task.category]}`}>
          {categoryLabels[task.category]}
        </span>
        {task.roomNumber && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <DoorOpen size={12} />
            Room {task.roomNumber}
          </span>
        )}
        {task.dueTime && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} />
            {task.dueTime}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <Avatar name={task.assignedTo} size="xs" />
          <span className="text-xs text-slate-500">{task.assignedTo}</span>
        </div>
      </div>
    </div>
  );
};
