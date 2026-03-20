import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  Send,
  FileText,
  ClipboardList,
  Mail,
  MessageCircle,
  Globe,
  Star,
  Check,
  ChevronDown,
  RotateCcw,
  Zap,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

// ─── Public type (re-exported so CommandCenter can import it) ─────────────────

export interface InboxPanelItem {
  id: string;
  urgency: 'urgent' | 'pending' | 'info' | 'review';
  channel: 'email' | 'booking' | 'whatsapp' | 'tripadvisor';
  channelLabel: string;
  subject: string;
  preview: string;
  guestName: string;
  timestamp: string;
  aiStatus: 'ai-ready' | 'action-required' | 'auto-resolved';
  aiDraftedReply?: string;
}

interface InboxSlidePanelProps {
  item: InboxPanelItem | null;
  onClose: () => void;
  onSend: (itemId: string, text: string, channel: string) => void;
}

// ─── Conversation history mock data ──────────────────────────────────────────

interface ConvMessage {
  id: string;
  sender: 'guest' | 'hotel' | 'system';
  senderName: string;
  content: string;
  relativeTime: string;
  channel: string;
}

const HISTORY: Record<string, ConvMessage[]> = {
  '1': [
    {
      id: '1a',
      sender: 'guest',
      senderName: 'M. Martin',
      content:
        'Hello, I had to cancel my reservation last minute due to a family emergency. I would like to request a full refund as per your cancellation policy. My booking reference is #GH-2847. Thank you for understanding.',
      relativeTime: '30 min ago',
      channel: 'Email',
    },
  ],
  '2': [
    {
      id: '2a',
      sender: 'system',
      senderName: 'Booking.com',
      content:
        'New reservation confirmed for L. Dubois. Standard Double Room, June 10-12 (2 nights). Total: EUR 284. Payment collected via Booking.com. Auto-confirmation sent to guest email.',
      relativeTime: '1h ago',
      channel: 'Booking.com',
    },
  ],
  '3': [
    {
      id: '3a',
      sender: 'guest',
      senderName: 'K. Johansson',
      content:
        'Hi! We land at 11pm on Friday at the main terminal. Do you offer a shuttle from the airport? How much does it cost and how do we book it? There will be 3 of us with luggage.',
      relativeTime: '2h ago',
      channel: 'WhatsApp',
    },
  ],
  '4': [
    {
      id: '4a',
      sender: 'guest',
      senderName: 'Jean M.',
      content:
        '"Disappointing stay. The room next to ours was extremely noisy all night and the air conditioning stopped working on day 2. Staff were friendly but the issues were never resolved despite two calls to reception."',
      relativeTime: '3h ago',
      channel: 'TripAdvisor',
    },
    {
      id: '4b',
      sender: 'hotel',
      senderName: 'Grand Horizon',
      content:
        'Thank you for your review, Jean. We are very sorry to hear about these issues. Our manager has been informed and will contact you directly to make this right.',
      relativeTime: '2h 30min ago',
      channel: 'TripAdvisor',
    },
  ],
  '5': [
    {
      id: '5a',
      sender: 'guest',
      senderName: 'C. Lefebvre',
      content:
        'Hello, we are organising a corporate retreat for 10 people in August (likely 14-17). Could you provide group rates for 5 rooms and any available meeting facilities? We would also need AV equipment.',
      relativeTime: '5h ago',
      channel: 'Email',
    },
    {
      id: '5b',
      sender: 'hotel',
      senderName: 'Grand Horizon',
      content:
        'Dear C. Lefebvre, thank you for considering The Grand Horizon for your corporate retreat. We are reviewing your request and will respond with our group rates shortly.',
      relativeTime: '4h ago',
      channel: 'Email',
    },
    {
      id: '5c',
      sender: 'guest',
      senderName: 'C. Lefebvre',
      content: 'Any updates? We need to confirm the venue by end of this week. Looking forward to hearing from you.',
      relativeTime: '1h ago',
      channel: 'Email',
    },
  ],
};

// ─── AI confidence data ───────────────────────────────────────────────────────

const AI_META: Record<string, { score: number; basis: string }> = {
  '1': { score: 96, basis: 'cancellation policy & past refund responses' },
  '3': { score: 92, basis: 'hotel services FAQ & pricing sheet' },
  '4': { score: 89, basis: 'review response guidelines & similar past replies' },
};

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  email: <Mail size={14} />,
  booking: <Globe size={14} />,
  whatsapp: <MessageCircle size={14} />,
  tripadvisor: <Star size={14} />,
};

const CHANNEL_PILL: Record<string, string> = {
  email: 'bg-slate-100 text-slate-600',
  booking: 'bg-blue-100 text-blue-700',
  whatsapp: 'bg-green-100 text-green-700',
  tripadvisor: 'bg-emerald-100 text-emerald-700',
};

const URGENCY_META: Record<string, { bar: string; badge: string; label: string; icon: React.ReactNode }> = {
  urgent: {
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Urgent',
    icon: <AlertTriangle size={11} />,
  },
  pending: {
    bar: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Needs Reply',
    icon: <Zap size={11} />,
  },
  review: {
    bar: 'bg-amber-400',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Review',
    icon: <Star size={11} />,
  },
  info: {
    bar: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Info',
    icon: null,
  },
};

const REPLY_CHANNELS = ['Email', 'WhatsApp', 'Booking.com', 'TripAdvisor'];

// ─── Maintenance detection ────────────────────────────────────────────────────

function isMaintenanceRelated(item: InboxPanelItem): boolean {
  return /\b(AC|air.condition|broken|maintenance|repair|leak|heating|plumbing|noise|noisy|hot.water|elevator|lift|wifi|television|TV)\b/i.test(
    item.subject + ' ' + item.preview,
  );
}

// ─── Bubble component ─────────────────────────────────────────────────────────

function Bubble({ msg, item }: { msg: ConvMessage; item: InboxPanelItem }) {
  if (msg.sender === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="max-w-xs text-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${CHANNEL_PILL[item.channel]}`}>
            {CHANNEL_ICON[item.channel]}
            {msg.senderName}
          </span>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{msg.content}</p>
          <p className="text-xs text-slate-400 mt-1">{msg.relativeTime}</p>
        </div>
      </div>
    );
  }

  const isHotel = msg.sender === 'hotel';

  return (
    <div className={`flex gap-2.5 mb-4 ${isHotel ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5 ${
          isHotel ? 'bg-blue-600' : 'bg-slate-400'
        }`}
      >
        {isHotel ? 'GH' : msg.senderName.charAt(0).toUpperCase()}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isHotel ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-slate-500">{msg.senderName}</span>
          <span className="text-xs text-slate-400">{msg.relativeTime}</span>
          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${CHANNEL_PILL[item.channel]}`}>
            {CHANNEL_ICON[item.channel]}
            {msg.channel}
          </span>
        </div>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isHotel
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-slate-100 text-slate-700 rounded-tl-sm'
          }`}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ─── AI card ──────────────────────────────────────────────────────────────────

function AICard({
  item,
  onUseDraft,
}: {
  item: InboxPanelItem;
  onUseDraft: () => void;
}) {
  const meta = AI_META[item.id];
  if (!meta || !item.aiDraftedReply) return null;

  const scoreColor =
    meta.score >= 90 ? 'bg-green-100 text-green-700' : meta.score >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  const barColor = meta.score >= 90 ? 'bg-green-500' : meta.score >= 80 ? 'bg-amber-500' : 'bg-slate-400';

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-blue-200">
        <div className="h-6 w-6 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
          <Sparkles size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-800">Suggested AI Response</p>
          <p className="text-xs text-blue-500 truncate">Based on your {meta.basis}</p>
        </div>
        {/* Confidence pill */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor}`}>
              {meta.score}% match
            </span>
            <div className="w-16 h-1 bg-blue-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${meta.score}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Draft preview */}
      <div className="px-4 py-3">
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
          {item.aiDraftedReply}
        </p>
      </div>

      {/* Use draft action */}
      <div className="px-4 pb-3">
        <button
          onClick={onUseDraft}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <FileText size={12} />
          Load into editor
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const InboxSlidePanel: React.FC<InboxSlidePanelProps> = ({ item, onClose, onSend }) => {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState('Email');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const isOpen = item !== null;

  // Populate textarea and channel when item changes
  useEffect(() => {
    if (item) {
      setReplyText(item.aiDraftedReply ?? '');
      // Pre-select channel matching the original source
      const map: Record<string, string> = {
        email: 'Email',
        booking: 'Booking.com',
        whatsapp: 'WhatsApp',
        tripadvisor: 'TripAdvisor',
      };
      setReplyChannel(map[item.channel] ?? 'Email');
      setSavedAt(null);
      setSending(false);
    }
  }, [item]);

  // Auto-focus textarea when panel opens, after animation
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => textareaRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Keyboard close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleUseDraft = useCallback(() => {
    if (item?.aiDraftedReply) {
      setReplyText(item.aiDraftedReply);
      textareaRef.current?.focus();
    }
  }, [item]);

  const handleSend = () => {
    if (!replyText.trim() || !item) return;
    setSending(true);
    // Simulate brief network delay for feel
    setTimeout(() => {
      onSend(item.id, replyText, replyChannel);
      setSending(false);
    }, 600);
  };

  const handleSaveDraft = () => {
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  };

  const handleCreateTask = () => {
    onClose();
    navigate('/operations');
  };

  const urgencyMeta = item ? URGENCY_META[item.urgency] : null;
  const history = item ? (HISTORY[item.id] ?? []) : [];
  const showCreateTask = item ? isMaintenanceRelated(item) : false;
  const charCount = replyText.length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          w-full md:w-[560px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex-shrink-0">
          {/* Urgency color strip */}
          {urgencyMeta && (
            <div className={`h-1 w-full ${urgencyMeta.bar}`} />
          )}

          <div className="px-5 py-4 border-b border-slate-200">
            {/* Top row: channel + urgency badge + close */}
            <div className="flex items-center gap-2 mb-2">
              {item && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CHANNEL_PILL[item.channel]}`}>
                  {CHANNEL_ICON[item.channel]}
                  {item.channelLabel}
                </span>
              )}
              {urgencyMeta && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyMeta.badge}`}>
                  {urgencyMeta.icon}
                  {urgencyMeta.label}
                </span>
              )}
              {item?.timestamp && (
                <span className="text-xs text-slate-400 ml-1">{item.timestamp}</span>
              )}
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Guest name */}
            <h2 className="text-lg font-bold text-slate-800 leading-tight mb-0.5">
              {item?.guestName ?? ''}
            </h2>

            {/* Subject */}
            <p className="text-sm text-slate-500 leading-snug">{item?.subject ?? ''}</p>

            {/* Reservation dates for bookings */}
            {item?.channel === 'booking' && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <Calendar size={13} className="text-slate-400" />
                <span>June 10 - 12, 2026 · 2 nights · Standard Double Room</span>
              </div>
            )}
          </div>
        </div>

        {/* ── SCROLLABLE BODY ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5">
            {/* Section label */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Conversation
            </p>

            {/* Chat bubbles */}
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <MessageCircle size={24} className="text-slate-200" />
                <p className="text-xs">No conversation history yet</p>
              </div>
            ) : (
              history.map((msg) => (
                <Bubble key={msg.id} msg={msg} item={item!} />
              ))
            )}

            {/* AI suggestion card */}
            {item?.aiStatus === 'ai-ready' && item.aiDraftedReply && (
              <AICard item={item} onUseDraft={handleUseDraft} />
            )}

            {/* Action Required note */}
            {item?.aiStatus === 'action-required' && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5">
                <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Manual reply required</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    This inquiry requires personalised pricing or information not available in the AI knowledge base. Please draft a reply below.
                  </p>
                </div>
              </div>
            )}

            {/* Auto-resolved note */}
            {item?.aiStatus === 'auto-resolved' && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-2.5">
                <Check size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-800">Auto-resolved</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    This item was handled automatically. A confirmation was sent to the guest. No action needed.
                  </p>
                </div>
              </div>
            )}

            {/* Spacer so last bubble clears the sticky footer */}
            <div className="h-4" />
          </div>
        </div>

        {/* ── STICKY ACTION FOOTER ────────────────────────────────────────── */}
        {item?.aiStatus !== 'auto-resolved' && (
          <div className="flex-shrink-0 border-t border-slate-200 bg-white">
            {/* Channel selector row */}
            <div className="flex items-center gap-3 px-5 pt-3 pb-2">
              <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Reply via</span>
              <div className="relative">
                <select
                  value={replyChannel}
                  onChange={(e) => setReplyChannel(e.target.value)}
                  className="appearance-none text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {REPLY_CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Restore draft link */}
              {item?.aiDraftedReply && replyText !== item.aiDraftedReply && (
                <button
                  onClick={handleUseDraft}
                  className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <RotateCcw size={11} />
                  Restore AI draft
                </button>
              )}

              {/* Char count */}
              <span className={`ml-auto text-xs ${charCount > 0 ? 'text-slate-400' : 'text-slate-300'}`}>
                {charCount > 0 ? `${charCount} chars` : ''}
              </span>
            </div>

            {/* Textarea */}
            <div className="px-5 pb-2">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply, or use the AI draft above..."
                rows={4}
                className="w-full resize-y text-sm text-slate-700 border border-slate-200 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-300 min-h-[96px] max-h-[240px]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
              {/* Send */}
              <button
                onClick={handleSend}
                disabled={!replyText.trim() || sending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send Reply
                  </>
                )}
              </button>

              {/* Save draft */}
              <button
                onClick={handleSaveDraft}
                disabled={!replyText.trim()}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savedAt ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    <span className="text-green-600">Saved!</span>
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Save Draft
                  </>
                )}
              </button>

              {/* Create task — only for maintenance */}
              {showCreateTask && (
                <button
                  onClick={handleCreateTask}
                  className="flex items-center gap-2 px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium rounded-lg transition-colors"
                >
                  <ClipboardList size={14} />
                  Create Task
                </button>
              )}
            </div>
          </div>
        )}

        {/* For auto-resolved items: just a close prompt */}
        {item?.aiStatus === 'auto-resolved' && (
          <div className="flex-shrink-0 border-t border-slate-200 px-5 py-4">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors"
            >
              <Check size={14} className="text-green-500" />
              Mark as reviewed & close
            </button>
          </div>
        )}
      </div>
    </>
  );
};
