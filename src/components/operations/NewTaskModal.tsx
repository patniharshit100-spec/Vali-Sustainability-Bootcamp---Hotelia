import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import type { Task, TaskCategory, TaskPriority, TaskSource } from '../../types';
import { mockConversations } from '../../data/mockData';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
}

// ─── Form config ──────────────────────────────────────────────────────────────

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'maintenance',   label: 'Maintenance' },
  { value: 'housekeeping',  label: 'Housekeeping' },
  { value: 'front_desk',    label: 'Front Desk' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'concierge',     label: 'Concierge' },
];

const PRIORITIES: { value: TaskPriority; label: string; icon: React.ReactNode; cls: string; selected: string }[] = [
  { value: 'urgent', label: 'Urgent',  icon: <AlertTriangle size={13} />, cls: 'border-red-200 text-red-600',    selected: 'bg-red-100 border-red-400 text-red-700 ring-2 ring-red-300' },
  { value: 'high',   label: 'High',    icon: <ArrowUp size={13} />,       cls: 'border-amber-200 text-amber-600', selected: 'bg-amber-100 border-amber-400 text-amber-700 ring-2 ring-amber-300' },
  { value: 'medium', label: 'Medium',  icon: <Minus size={13} />,         cls: 'border-sky-200 text-sky-600',    selected: 'bg-sky-100 border-sky-400 text-sky-700 ring-2 ring-sky-300' },
  { value: 'low',    label: 'Low',     icon: <ArrowDown size={13} />,     cls: 'border-slate-200 text-slate-500', selected: 'bg-slate-100 border-slate-400 text-slate-600 ring-2 ring-slate-300' },
];

const STAFF = ['Rosa M.', 'Tom K.', 'Carmen L.', 'Ana P.', 'Miguel S.', 'Maria S.'];

// ─── Field primitives ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300 bg-white"
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300 resize-none bg-white"
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
    >
      {children}
    </select>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('maintenance');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [sourceConvId, setSourceConvId] = useState('');
  const [source, setSource] = useState<TaskSource>('manual');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Keyboard close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setTitle(''); setDescription(''); setCategory('maintenance');
      setPriority('medium'); setAssignedTo(''); setRoomNumber('');
      setDueTime(''); setSourceConvId(''); setSource('manual'); setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!assignedTo) e.assignedTo = 'Please assign to a staff member';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      priority,
      status: 'todo',
      category,
      assignedTo,
      roomNumber: roomNumber.trim() || undefined,
      dueTime: dueTime || undefined,
      createdAt: new Date().toISOString(),
      source,
      sourceConversationId: sourceConvId || undefined,
    };
    onSubmit(newTask);
    onClose();
  };

  const handleSourceConvChange = (id: string) => {
    setSourceConvId(id);
    if (id) setSource('guest_request');
    else if (source === 'guest_request') setSource('manual');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">New Task</h2>
            <p className="text-xs text-slate-400 mt-0.5">Add a task to the operations board</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Title */}
            <div>
              <Label required>Task title</Label>
              <Input
                placeholder="e.g. Fix broken tap in Room 204"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Additional details, steps, or context…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Category + Room */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Category</Label>
                <Select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Room number</Label>
                <Input
                  placeholder="e.g. 204"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label required>Priority</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      priority === p.value ? p.selected : `${p.cls} hover:bg-slate-50`
                    }`}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign to + Due time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Assign to</Label>
                <Select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Select staff…</option>
                  {STAFF.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
                {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo}</p>}
              </div>
              <div>
                <Label>Due time</Label>
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <Label>Task source</Label>
              <div className="flex gap-2">
                {(['manual', 'scheduled'] as TaskSource[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSource(s); if (s !== 'guest_request') setSourceConvId(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                      source === s && !sourceConvId
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s === 'manual' ? 'Manual' : 'Scheduled'}
                  </button>
                ))}
              </div>
            </div>

            {/* Link to guest conversation */}
            <div>
              <Label>
                <span className="flex items-center gap-1.5">
                  Link to guest conversation
                  <span className="text-slate-400 font-normal">(optional)</span>
                </span>
              </Label>
              <Select
                value={sourceConvId}
                onChange={(e) => handleSourceConvChange(e.target.value)}
              >
                <option value="">No conversation linked</option>
                {mockConversations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.guestName} — {c.lastMessage.slice(0, 50)}{c.lastMessage.length > 50 ? '…' : ''}
                  </option>
                ))}
              </Select>
              {sourceConvId && (
                <p className="text-xs text-purple-600 mt-1.5 flex items-center gap-1">
                  <Sparkles size={11} />
                  Source will be set to "Guest Request" with a link to the conversation
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
