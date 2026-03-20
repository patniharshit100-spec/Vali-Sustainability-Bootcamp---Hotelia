import React from 'react';
import { Phone, PhoneMissed, Clock, TrendingUp } from 'lucide-react';
import { useCallStore } from '../stores/callStore';
import { ActiveCallPanel } from '../components/callcenter/ActiveCallPanel';
import { CallLogTable } from '../components/callcenter/CallLogTable';
import { OutboundDialer } from '../components/callcenter/OutboundDialer';
import { VendorDirectory } from '../components/callcenter/VendorDirectory';

export const CallCenter: React.FC = () => {
  const { callLogs, activeCall } = useCallStore();

  const totalToday = callLogs.filter((l) => l.startedAt.startsWith('2026-03-20')).length;
  const missed = callLogs.filter((l) => l.status === 'missed').length;
  const avgDuration = callLogs
    .filter((l) => l.durationSeconds)
    .reduce((sum, l, _, arr) => sum + (l.durationSeconds! / arr.length), 0);

  const stats = [
    { id: 'total', label: 'Calls Today', value: totalToday, icon: <Phone size={16} className="text-blue-600" />, bg: 'bg-blue-50' },
    { id: 'missed', label: 'Missed', value: missed, icon: <PhoneMissed size={16} className="text-red-500" />, bg: 'bg-red-50' },
    { id: 'avg', label: 'Avg Duration', value: `${Math.floor(avgDuration / 60)}m ${Math.floor(avgDuration % 60)}s`, icon: <Clock size={16} className="text-violet-600" />, bg: 'bg-violet-50' },
    { id: 'resolved', label: 'Resolved', value: callLogs.filter((l) => l.outcome === 'resolved').length, icon: <TrendingUp size={16} className="text-green-600" />, bg: 'bg-green-50' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-slate-800">AI Call Center</h1>
          <p className="text-sm text-slate-500">Manage inbound &amp; outbound calls with live AI assistance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left column: active call + dialer */}
          <div className="space-y-4">
            {activeCall ? (
              <ActiveCallPanel />
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                  <Phone size={22} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No active call</p>
                <p className="text-xs text-slate-400 mt-1">Use the dialer below or receive an inbound call</p>
              </div>
            )}

            <OutboundDialer />
          </div>

          {/* Right columns: call log + vendors */}
          <div className="xl:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent Calls</h2>
              <CallLogTable logs={callLogs} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Vendor Directory</h2>
              <VendorDirectory />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
