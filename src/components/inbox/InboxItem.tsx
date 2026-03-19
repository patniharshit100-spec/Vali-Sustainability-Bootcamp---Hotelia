import React from 'react';
import { Mail, MessageCircle, Star, Globe, MapPin } from 'lucide-react';
import type { Message, MessageSource } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface InboxItemProps {
  message: Message;
  isSelected: boolean;
  onClick: () => void;
}

const sourceIcons: Record<MessageSource, React.ReactNode> = {
  email: <Mail size={12} />,
  whatsapp: <MessageCircle size={12} />,
  booking: <Globe size={12} />,
  expedia: <Globe size={12} />,
  tripadvisor: <MapPin size={12} />,
  google: <Star size={12} />,
};

const sourceLabels: Record<MessageSource, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  google: 'Google',
};

const sourceColors: Record<MessageSource, string> = {
  email: 'bg-slate-100 text-slate-600',
  whatsapp: 'bg-green-100 text-green-700',
  booking: 'bg-blue-100 text-blue-700',
  expedia: 'bg-yellow-100 text-yellow-700',
  tripadvisor: 'bg-emerald-100 text-emerald-700',
  google: 'bg-red-100 text-red-700',
};

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const InboxItem: React.FC<InboxItemProps> = ({ message, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-slate-50'
      } ${!message.isRead ? 'bg-white' : 'bg-slate-50/50'}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <Avatar name={message.guestName} size="sm" />
          {!message.isRead && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-blue-600 rounded-full border-2 border-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-sm truncate ${!message.isRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
              {message.guestName}
            </span>
            <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(message.timestamp)}</span>
          </div>
          <p className={`text-xs truncate mb-1.5 ${!message.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
            {message.subject}
          </p>
          <p className="text-xs text-slate-400 truncate mb-2">{message.preview}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${sourceColors[message.source]}`}>
              {sourceIcons[message.source]}
              {sourceLabels[message.source]}
            </span>
            {message.isUrgent && (
              <Badge variant="danger" size="sm">Urgent</Badge>
            )}
            {message.aiSuggested && (
              <Badge variant="primary" size="sm">AI Ready</Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
