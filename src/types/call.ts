// ── Call Center Types ──────────────────────────────────────────────────────

export type CallDirection = 'inbound' | 'outbound';
export type CallStatus = 'ringing' | 'active' | 'on_hold' | 'ended' | 'missed' | 'voicemail';
export type CallOutcome = 'resolved' | 'transferred' | 'callback_scheduled' | 'voicemail_left' | 'no_answer' | 'abandoned';
export type CallCategory = 'reservation' | 'complaint' | 'inquiry' | 'vendor' | 'emergency' | 'other';

export type TranscriptLine = {
  id: string;
  speaker: 'guest' | 'agent' | 'ai';
  text: string;
  timestamp: number; // seconds from call start
};

export type CallLog = {
  id: string;
  direction: CallDirection;
  status: CallStatus;
  outcome?: CallOutcome;
  category: CallCategory;
  callerName: string;
  callerPhone: string;
  agentName: string;
  startedAt: string;       // ISO string
  endedAt?: string;        // ISO string
  durationSeconds?: number;
  transcript?: TranscriptLine[];
  aiSummary?: string;
  aiActions?: string[];    // suggested follow-up actions
  recordingUrl?: string;
  notes?: string;
  guestReservationId?: string;
};

export type ActiveCall = {
  callId: string;
  direction: CallDirection;
  callerName: string;
  callerPhone: string;
  startedAt: Date;
  status: CallStatus;
  transcript: TranscriptLine[];
  isTranscribing: boolean;
  aiSuggestion?: string;   // live AI hint shown during call
};

export type Vendor = {
  id: string;
  name: string;
  category: 'maintenance' | 'cleaning' | 'catering' | 'transport' | 'security' | 'medical' | 'other';
  phone: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isEmergency: boolean;
};

export type DialerState = {
  digits: string;
  label: string;
};
