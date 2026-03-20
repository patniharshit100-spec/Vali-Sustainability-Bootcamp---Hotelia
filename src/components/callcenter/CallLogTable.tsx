import React, { useState } from 'react';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { CallLog } from '../../types/call';
import { formatDuration } from '../../services/vapiService';

interface Props {
  logs: CallLog[];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const DIRECTION_ICON: Record<string, React.ReactNode> = {
  inbound: <PhoneIncoming size={14} className="text-green-600" />,
  outbound: <PhoneOutgoing size={14} className="text-blue-600" />,
};

const STATUS_BADGE: Record<string, string> = {
  ended: 'bg-slate-100 text-slate-600',
  missed: 'bg-red-100 text-red-600',
  voicemail: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  ringing: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
};

const CATEGORY_COLORS: Record<string, string> = {
  reservation: 'bg-blue-50 text-blue-700',
  complaint: 'bg-red-50 text-red-700',
  inquiry: 'bg-slate-100 text-slate-600',
  vendor: 'bg-violet-50 text-violet-700',
  emergency: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-500',
};

function CallRow({ log }: { log: CallLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {log.status === 'missed' ? <PhoneMissed size={14} className="text-red-500" /> : DIRECTION_ICON[log.direction]}
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{log.callerName}</p>
              <p className="text-xs text-slate-400">{log.callerPhone}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[log.category]}`}>
            {log.category}
          </span>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[log.status]}`}>
            {log.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-500">
          {log.durationSeconds ? formatDuration(log.durationSeconds) : '—'}
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{formatTime(log.startedAt)}</td>
        <td className="px-4 py-3 text-slate-400">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-blue-50/40 border-b border-slate-100">
          <td colSpan={6} className="px-6 py-4 space-y-3">
            {/* AI Summary */}
            {log.aiSummary && (
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-0.5">AI Summary</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{log.aiSummary}</p>
                </div>
              </div>
            )}

            {/* AI Actions */}
            {log.aiActions && log.aiActions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Suggested Actions</p>
                <ul className="space-y-1">
                  {log.aiActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transcript snippet */}
            {log.transcript && log.transcript.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Transcript</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {log.transcript.filter((l) => l.speaker !== 'ai').map((line) => (
                    <p key={line.id} className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700 capitalize">{line.speaker}:</span>{' '}
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {!log.aiSummary && !log.transcript && (
              <p className="text-xs text-slate-400 italic">No details available for this call.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export const CallLogTable: React.FC<Props> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 gap-2">
        <PhoneIncoming size={24} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No calls yet</p>
        <p className="text-xs">Calls will appear here once made or received.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Caller</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Duration</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <CallRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
