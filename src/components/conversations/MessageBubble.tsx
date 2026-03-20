import React from 'react';
import { Sparkles, Mail, MessageCircle, Globe, Star } from 'lucide-react';
import type { ChatMessage, MessageSource } from '../../types';
import { Avatar } from '../common/Avatar';

interface MessageBubbleProps {
  message: ChatMessage;
}

// ─── Channel decoration ───────────────────────────────────────────────────────

const CHANNEL_ICON: Partial<Record<MessageSource, React.ReactNode>> = {
  email: <Mail size={10} />,
  whatsapp: <MessageCircle size={10} />,
  booking: <Globe size={10} />,
  expedia: <Globe size={10} />,
  tripadvisor: <Star size={10} />,
  google: <Globe size={10} />,
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

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Channel chip ─────────────────────────────────────────────────────────────

function ChannelChip({ channel }: { channel?: MessageSource }) {
  if (!channel) return null;
  const pillClass = CHANNEL_PILL[channel];
  const icon = CHANNEL_ICON[channel];
  const label = CHANNEL_LABEL[channel];
  if (!pillClass) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${pillClass}`}>
      {icon}
      {label}
    </span>
  );
}

// ─── AI bubble ────────────────────────────────────────────────────────────────

function AIBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-center mb-5">
      <div className="max-w-md w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-5 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-blue-700">AI Auto-Reply</span>
          <ChannelChip channel={message.channel} />
          <span className="ml-auto text-xs text-slate-400">{formatTime(message.timestamp)}</span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isStaff = message.sender === 'staff';
  const isAI = message.sender === 'ai' || message.isAIGenerated;

  if (isAI) return <AIBubble message={message} />;

  return (
    <div className={`flex items-end gap-2.5 mb-4 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar name={message.senderName} size="xs" />
      </div>

      {/* Bubble + meta */}
      <div className={`flex flex-col gap-1 max-w-[72%] ${isStaff ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        <span className="text-xs text-slate-400 px-1">{message.senderName}</span>

        {/* Bubble */}
        <div
          className={`relative px-4 py-2.5 shadow-sm ${
            isStaff
              ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>

          {/* AI badge overlay */}
          {message.isAIGenerated && (
            <span className="absolute -top-2 -right-1 inline-flex items-center gap-0.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              <Sparkles size={8} />
              AI
            </span>
          )}
        </div>

        {/* Time + channel chip */}
        <div className={`flex items-center gap-1.5 px-1 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          <ChannelChip channel={message.channel} />
        </div>
      </div>
    </div>
  );
};

// ─── Date divider ─────────────────────────────────────────────────────────────

export function DateDivider({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (d.toDateString() === now.toDateString()) label = 'Today';
  else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
  else label = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-medium text-slate-400 flex-shrink-0">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}
