import { create } from 'zustand';
import type { CallLog, ActiveCall, CallStatus } from '../types/call';
import { mockCallLogs } from '../data/mockCallData';

interface CallStore {
  callLogs: CallLog[];
  activeCall: ActiveCall | null;
  selectedCallId: string | null;

  // Actions
  selectCall: (id: string | null) => void;
  startCall: (callerName: string, callerPhone: string, direction: 'inbound' | 'outbound') => void;
  endCall: () => void;
  setCallStatus: (status: CallStatus) => void;
  addTranscriptLine: (speaker: 'guest' | 'agent' | 'ai', text: string) => void;
  setAiSuggestion: (suggestion: string) => void;
  addCallLog: (log: CallLog) => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  callLogs: mockCallLogs,
  activeCall: null,
  selectedCallId: null,

  selectCall: (id) => set({ selectedCallId: id }),

  startCall: (callerName, callerPhone, direction) => {
    const callId = `call-${Date.now()}`;
    set({
      activeCall: {
        callId,
        direction,
        callerName,
        callerPhone,
        startedAt: new Date(),
        status: 'active',
        transcript: [],
        isTranscribing: true,
        aiSuggestion: undefined,
      },
    });
  },

  endCall: () => {
    const { activeCall, callLogs } = get();
    if (!activeCall) return;

    const durationSeconds = Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000);
    const newLog: CallLog = {
      id: activeCall.callId,
      direction: activeCall.direction,
      status: 'ended',
      outcome: 'resolved',
      category: 'inquiry',
      callerName: activeCall.callerName,
      callerPhone: activeCall.callerPhone,
      agentName: 'Maria Santos',
      startedAt: activeCall.startedAt.toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds,
      transcript: activeCall.transcript,
      aiSummary: 'Call ended. AI summary pending.',
      aiActions: [],
    };

    set({
      activeCall: null,
      callLogs: [newLog, ...callLogs],
    });
  },

  setCallStatus: (status) =>
    set((state) =>
      state.activeCall ? { activeCall: { ...state.activeCall, status } } : {}
    ),

  addTranscriptLine: (speaker, text) =>
    set((state) => {
      if (!state.activeCall) return {};
      const line = {
        id: `t-${Date.now()}`,
        speaker,
        text,
        timestamp: Math.floor((Date.now() - state.activeCall.startedAt.getTime()) / 1000),
      };
      return {
        activeCall: {
          ...state.activeCall,
          transcript: [...state.activeCall.transcript, line],
        },
      };
    }),

  setAiSuggestion: (suggestion) =>
    set((state) =>
      state.activeCall ? { activeCall: { ...state.activeCall, aiSuggestion: suggestion } } : {}
    ),

  addCallLog: (log) =>
    set((state) => ({ callLogs: [log, ...state.callLogs] })),
}));
