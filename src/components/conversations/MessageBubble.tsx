import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { Avatar } from '../common/Avatar';

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isStaff = message.sender === 'staff';
  const isAI = message.sender === 'ai';

  if (isAI) {
    return (
      <div className="flex justify-center mb-4">
        <div className="max-w-sm bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={13} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">AI Assistant</span>
          </div>
          <p className="text-sm text-slate-700">{message.content}</p>
          <p className="text-xs text-slate-400 mt-1.5">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-4 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar name={message.senderName} size="xs" />
      <div className={`max-w-xs lg:max-w-md ${isStaff ? 'items-end' : 'items-start'} flex flex-col`}>
        <span className="text-xs text-slate-400 mb-1 px-1">{message.senderName}</span>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isStaff
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <span className="text-xs text-slate-400 mt-1 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};
