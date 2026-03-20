import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  MessageCircle,
  Globe,
  Star,
  Calendar,
  ExternalLink,
  ClipboardList,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import type { Conversation, MessageSource, ChatMessage } from '../../types';
import { Avatar } from '../common/Avatar';
import { MessageBubble, DateDivider } from './MessageBubble';
import { ReplyComposer } from './ReplyComposer';

interface ConversationThreadProps {
  conversation: Conversation;
  onResolved?: (id: string) => void;
  onBack?: () => void;
}

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_ICON: Partial<Record<MessageSource, React.ReactNode>> = {
  email: <Mail size={13} />,
  whatsapp: <MessageCircle size={13} />,
  booking: <Globe size={13} />,
  expedia: <Globe size={13} />,
  tripadvisor: <Star size={13} />,
  google: <Globe size={13} />,
};

const CHANNEL_PILL: Partial<Record<MessageSource, string>> = {
  email: 'bg-slate-100 text-slate-600',
  whatsapp: 'bg-green-100 text-green-700',
  booking: 'bg-blue-100 text-blue-700',
  expedia: 'bg-yellow-100 text-yellow-800',
  tripadvisor: 'bg-emerald-100 text-emerald-700',
  google: 'bg-red-100 text-red-700',
};

const CHANNEL_LABEL: Partial<Record<MessageSource, string>> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  google: 'Google',
};

const URGENCY_BADGE: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  waiting: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

const URGENCY_LABEL: Record<string, string> = {
  urgent: 'Urgent',
  waiting: 'Awaiting Reply',
  resolved: 'Resolved',
};

// ─── Date grouping ────────────────────────────────────────────────────────────

function dayKey(ts: string): string {
  return new Date(ts).toDateString();
}

function groupByDay(messages: ChatMessage[]): Array<{ day: string; messages: ChatMessage[] }> {
  const groups: Map<string, ChatMessage[]> = new Map();
  for (const msg of messages) {
    const key = dayKey(msg.timestamp);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }
  return Array.from(groups.entries()).map(([day, msgs]) => ({ day, messages: msgs }));
}

// ─── Format reservation dates ─────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  conversation,
  onResolved,
  onBack,
}) => {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [resolved, setResolved] = useState(conversation.status === 'resolved');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Sync when conversation changes
  useEffect(() => {
    setMessages(conversation.messages);
    setResolved(conversation.status === 'resolved');
  }, [conversation]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string, channel: MessageSource) => {
    const newMsg: ChatMessage = {
      id: `new-${Date.now()}`,
      sender: 'staff',
      senderName: 'Maria S.',
      content: text,
      timestamp: new Date().toISOString(),
      channel,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const toggleResolved = () => {
    const next = !resolved;
    setResolved(next);
    onResolved?.(conversation.id);
  };

  const groups = groupByDay(messages);
  const hasReservation = !!(conversation.checkIn && conversation.checkOut);
  const uniqueChannels = [...new Set(conversation.channels)];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 py-4">
        {/* Mobile back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-blue-600 mb-3 -ml-1 min-h-[44px] px-1"
          >
            <ChevronLeft size={20} />
            All conversations
          </button>
        )}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar name={conversation.guestName} size="md" className="flex-shrink-0 mt-0.5" />

          {/* Info block */}
          <div className="flex-1 min-w-0">
            {/* Row 1: name + urgency badge + action button */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">{conversation.guestName}</h3>
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_BADGE[resolved ? 'resolved' : conversation.urgency]}`}>
                {URGENCY_LABEL[resolved ? 'resolved' : conversation.urgency]}
              </span>

              {/* Resolve / Reopen toggle */}
              <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setStatusMenuOpen((o) => !o)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      resolved
                        ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {resolved ? <Check size={13} /> : <RotateCcw size={13} />}
                    {resolved ? 'Resolved' : 'Mark resolved'}
                    <ChevronDown size={11} />
                  </button>
                  {statusMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                      <button
                        onClick={() => { toggleResolved(); setStatusMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        {resolved ? 'Reopen conversation' : 'Mark as resolved'}
                      </button>
                      <button
                        onClick={() => setStatusMenuOpen(false)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        Assign to colleague
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: channels */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {uniqueChannels.map((ch) => (
                <span
                  key={ch}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${CHANNEL_PILL[ch] ?? 'bg-slate-100 text-slate-600'}`}
                >
                  {CHANNEL_ICON[ch]}
                  {CHANNEL_LABEL[ch]}
                </span>
              ))}
            </div>

            {/* Row 3: reservation dates + quick links */}
            {hasReservation && (
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={12} className="text-slate-400" />
                  <span>
                    {fmtDate(conversation.checkIn!)} → {fmtDate(conversation.checkOut!)}
                    {conversation.roomType && (
                      <> · <span className="font-medium text-slate-600">{conversation.roomType}</span></>
                    )}
                    {conversation.roomNumber && (
                      <> · Room {conversation.roomNumber}</>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  <button
                    onClick={() => navigate('/reservations')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <ExternalLink size={11} />
                    View Reservation
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    onClick={() => navigate('/operations')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
                  >
                    <ClipboardList size={11} />
                    Create Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MESSAGE THREAD ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <MessageCircle size={32} className="text-slate-200" />
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.day}>
              <DateDivider date={group.messages[0].timestamp} />
              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── REPLY COMPOSER (sticky bottom) ─────────────────────────────────── */}
      <ReplyComposer
        onSend={handleSend}
        defaultChannel={conversation.channel}
        aiSuggested={conversation.aiSuggested}
      />
    </div>
  );
};
