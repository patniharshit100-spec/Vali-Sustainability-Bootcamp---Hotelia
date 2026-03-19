import React from 'react';
import { Archive, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react';
import type { Message } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AIResponseCard } from './AIResponseCard';

interface MessageDetailProps {
  message: Message;
}

const sourceLabels: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  google: 'Google',
};

function formatDateFull(ts: string): string {
  return new Date(ts).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MessageDetail: React.FC<MessageDetailProps> = ({ message }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-800">{message.subject}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">via {sourceLabels[message.source]}</span>
            {message.isUrgent && <Badge variant="danger" size="sm">Urgent</Badge>}
            {message.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Archive size={16} />}>Archive</Button>
          <Button variant="ghost" size="sm" icon={<Trash2 size={16} />} className="text-red-500 hover:bg-red-50">Delete</Button>
          <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Sender info */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={message.guestName} size="md" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{message.guestName}</p>
              <p className="text-xs text-slate-500">{formatDateFull(message.timestamp)}</p>
            </div>
          </div>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View guest profile <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{message.body}</p>
      </div>

      {/* AI Suggested Reply */}
      {message.aiSuggested && (
        <div className="px-6 pb-6 pt-4 border-t border-slate-200">
          <AIResponseCard
            suggestion={message.aiSuggested}
            onSend={(text) => console.log('Sending:', text)}
          />
        </div>
      )}
    </div>
  );
};
