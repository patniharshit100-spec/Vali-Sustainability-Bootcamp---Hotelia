import React, { useEffect, useState } from 'react';
import { PhoneOff, Pause, Mic, MicOff, Sparkles, User, Bot } from 'lucide-react';
import { useCallStore } from '../../stores/callStore';
import { startTranscription, stopTranscription, formatDuration } from '../../services/vapiService';
import { generateCallSummary } from '../../services/callAI';

export const ActiveCallPanel: React.FC = () => {
  const { activeCall, endCall, setCallStatus } = useCallStore();
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!activeCall) return;
    startTranscription(activeCall.callerName);

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000));
    }, 1000);

    return () => {
      clearInterval(timer);
      stopTranscription();
    };
  }, [activeCall?.callId]);

  const handleEnd = async () => {
    if (!activeCall) return;
    stopTranscription();
    const { summary, actions } = await generateCallSummary(activeCall.transcript, activeCall.callerName);
    useCallStore.setState((s) =>
      s.activeCall ? { activeCall: { ...s.activeCall, aiSuggestion: `Summary: ${summary}` } } : {}
    );
    // brief pause so user sees summary flash, then end
    setTimeout(() => {
      const store = useCallStore.getState();
      if (store.activeCall) {
        const log = store.callLogs[0];
        if (log) {
          useCallStore.setState((s) => ({
            callLogs: s.callLogs.map((l) =>
              l.id === log.id ? { ...l, aiSummary: summary, aiActions: actions } : l
            ),
          }));
        }
      }
      endCall();
    }, 1200);
  };

  const handleHold = () => {
    if (!activeCall) return;
    const next = activeCall.status === 'on_hold' ? 'active' : 'on_hold';
    setCallStatus(next);
  };

  if (!activeCall) return null;

  const isOnHold = activeCall.status === 'on_hold';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">{activeCall.callerName}</p>
              <p className="text-xs text-green-100">{activeCall.callerPhone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold font-mono">{formatDuration(elapsed)}</p>
            <p className="text-xs text-green-100 capitalize">
              {isOnHold ? '⏸ On Hold' : activeCall.direction === 'inbound' ? '↙ Inbound' : '↗ Outbound'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Suggestion */}
      {activeCall.aiSuggestion && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-blue-50 border-b border-blue-100">
          <Sparkles size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 leading-relaxed">{activeCall.aiSuggestion}</p>
        </div>
      )}

      {/* Transcript */}
      <div className="h-52 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {activeCall.transcript.length === 0 ? (
          <p className="text-xs text-slate-400 text-center mt-8">Transcription will appear here…</p>
        ) : (
          activeCall.transcript.map((line) => (
            <div
              key={line.id}
              className={`flex gap-2 ${line.speaker === 'agent' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs ${
                  line.speaker === 'ai'
                    ? 'bg-blue-500'
                    : line.speaker === 'agent'
                    ? 'bg-slate-600'
                    : 'bg-green-500'
                }`}
              >
                {line.speaker === 'ai' ? <Bot size={12} /> : line.speaker === 'agent' ? 'A' : 'G'}
              </div>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  line.speaker === 'ai'
                    ? 'bg-blue-100 text-blue-800 italic'
                    : line.speaker === 'agent'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {line.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-4 border-t border-slate-100">
        <button
          onClick={() => setMuted((m) => !m)}
          className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
            muted ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={handleHold}
          className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors ${
            isOnHold ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title={isOnHold ? 'Resume' : 'Hold'}
        >
          <Pause size={18} />
        </button>

        <button
          onClick={handleEnd}
          className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
          title="End call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};
