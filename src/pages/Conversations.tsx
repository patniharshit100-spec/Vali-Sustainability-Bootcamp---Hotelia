import React, { useState } from 'react';
import type { Conversation } from '../types';
import { ConversationList } from '../components/conversations/ConversationList';
import { ConversationThread } from '../components/conversations/ConversationThread';
import { MessageSquare } from 'lucide-react';

export const Conversations: React.FC = () => {
  const [selected, setSelected] = useState<Conversation | null>(null);

  return (
    <div className="flex h-full">
      <ConversationList selectedId={selected?.id ?? null} onSelect={setSelected} />
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <ConversationThread conversation={selected} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <MessageSquare size={40} className="text-slate-200" />
            <p className="text-sm font-medium">Select a conversation to open</p>
            <p className="text-xs text-slate-400">All guest messages across channels in one place</p>
          </div>
        )}
      </div>
    </div>
  );
};
