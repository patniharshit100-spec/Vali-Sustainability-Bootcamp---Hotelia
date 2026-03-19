import React from 'react';
import {
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import { mockMessages, mockTasks, mockKPIs, mockReservations } from '../data/mockData';
import { Badge } from '../components/common/Badge';
import { InboxList } from '../components/inbox/InboxList';
import { MessageDetail } from '../components/inbox/MessageDetail';
import { useInboxStore } from '../stores/inboxStore';

function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium mb-0.5">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

const urgentMessages = mockMessages.filter((m) => m.isUrgent && !m.isRead);
const urgentTasks = mockTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');
const checkedIn = mockReservations.filter((r) => r.status === 'checked_in');
const todayArrivals = mockReservations.filter((r) => r.status === 'confirmed');

export const CommandCenter: React.FC = () => {
  const { messages, selectedMessageId } = useInboxStore();
  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  return (
    <div className="p-6 space-y-6">
      {/* AI Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-1">Good morning, Maria!</h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              You have <strong className="text-white">2 urgent messages</strong> requiring immediate attention, <strong className="text-white">1 urgent task</strong> due before 11am, and <strong className="text-white">4 guests</strong> arriving today. Today looks like a busy one — let's get started!
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          icon={<AlertTriangle size={20} className="text-red-500" />}
          label="Urgent Messages"
          value={urgentMessages.length}
          sub="Need immediate reply"
          color="bg-red-50"
        />
        <SummaryCard
          icon={<ClipboardList size={20} className="text-amber-500" />}
          label="Active Tasks"
          value={urgentTasks.length}
          sub="High/urgent priority"
          color="bg-amber-50"
        />
        <SummaryCard
          icon={<Users size={20} className="text-blue-500" />}
          label="Guests In-House"
          value={checkedIn.length}
          sub="Currently checked in"
          color="bg-blue-50"
        />
        <SummaryCard
          icon={<TrendingUp size={20} className="text-green-500" />}
          label="Today's Arrivals"
          value={todayArrivals.length}
          sub="Expected today"
          color="bg-green-50"
        />
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {mockKPIs.slice(0, 3).map((kpi) => (
          <div key={kpi.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className="text-lg font-bold text-slate-800">{kpi.value}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${kpi.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {kpi.change > 0 ? '+' : ''}{kpi.change}%
            </span>
          </div>
        ))}
      </div>

      {/* Priority Inbox */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-400" />
            Priority Inbox
          </h2>
          <Badge variant="danger" size="sm">{urgentMessages.length} urgent</Badge>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex h-[480px]">
            <div className="w-72 flex-shrink-0 border-r border-slate-200 overflow-hidden">
              <InboxList />
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedMessage ? (
                <MessageDetail message={selectedMessage} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <MessageSquare size={32} className="text-slate-200" />
                  <p className="text-sm">Select a message to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
