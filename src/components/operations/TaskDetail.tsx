import React from 'react';
import { Clock, DoorOpen, Tag, Calendar } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useTasksStore } from '../../stores/tasksStore';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
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

const statusTransitions: Record<TaskStatus, { label: string; next: TaskStatus } | null> = {
  todo: { label: 'Start Task', next: 'in_progress' },
  in_progress: { label: 'Mark Complete', next: 'done' },
  done: null,
};

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const { updateTaskStatus } = useTasksStore();
  const transition = statusTransitions[task.status];

  return (
    <div className="p-5 space-y-5">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold text-slate-800">{task.title}</h3>
          <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Category</p>
          <div className="flex items-center gap-1.5">
            <Tag size={14} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{categoryLabels[task.category]}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Status</p>
          <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
        {task.roomNumber && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Room</p>
            <div className="flex items-center gap-1.5">
              <DoorOpen size={14} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Room {task.roomNumber}</span>
            </div>
          </div>
        )}
        {task.dueTime && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Due Time</p>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{task.dueTime}</span>
            </div>
          </div>
        )}
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Assigned To</p>
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignedTo} size="xs" />
            <span className="text-sm font-medium text-slate-700">{task.assignedTo}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Created</p>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {transition && (
        <Button
          variant="primary"
          className="w-full justify-center"
          onClick={() => {
            updateTaskStatus(task.id, transition.next);
            onClose();
          }}
        >
          {transition.label}
        </Button>
      )}
    </div>
  );
};
