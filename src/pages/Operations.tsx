import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useTasksStore } from '../stores/tasksStore';
import { TaskList } from '../components/operations/TaskList';
import { TaskDetail } from '../components/operations/TaskDetail';
import { SlidePanel } from '../components/common/SlidePanel';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Operations: React.FC = () => {
  const { tasks, selectedTaskId, selectTask } = useTasksStore();
  const [panelOpen, setPanelOpen] = useState(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const handleSelectTask = (id: string) => {
    selectTask(id);
    setPanelOpen(true);
  };

  const urgentCount = tasks.filter((t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done').length;

  return (
    <div className="flex flex-col h-full">
      {/* Page toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-700">All Tasks</h2>
          {urgentCount > 0 && (
            <Badge variant="danger" size="sm">{urgentCount} urgent</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Filter size={14} />}>Filter</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>New Task</Button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <TaskList tasks={tasks} onSelectTask={handleSelectTask} />
      </div>

      {/* Task detail slide panel */}
      <SlidePanel
        isOpen={panelOpen && !!selectedTask}
        onClose={() => setPanelOpen(false)}
        title="Task Details"
        width="md"
      >
        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => setPanelOpen(false)} />
        )}
      </SlidePanel>
    </div>
  );
};
