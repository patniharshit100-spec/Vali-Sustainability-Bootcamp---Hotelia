import React, { useRef, useEffect } from 'react';
import type { Conversation } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { MessageBubble } from './MessageBubble';
import { ReplyComposer } from './ReplyComposer';

interface ConversationThreadProps {
  conversation: Conversation;
}

const channelLabels: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  google: 'Google',
};

export const ConversationThread: React.FC<ConversationThreadProps> = ({ conversation }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
        <Avatar name={conversation.guestName} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">{conversation.guestName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500">{channelLabels[conversation.channel]}</span>
            <Badge
              variant={conversation.status === 'open' ? 'warning' : 'success'}
              size="sm"
              dot
            >
              {conversation.status}
            </Badge>
          </div>
        </div>
        <Badge variant={conversation.status === 'open' ? 'warning' : 'success'}>
          {conversation.status === 'open' ? 'Mark resolved' : 'Reopen'}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      <ReplyComposer onSend={(text) => console.log('Reply:', text)} />
    </div>
  );
};
