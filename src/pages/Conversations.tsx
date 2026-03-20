import React, { useState } from 'react';
import type { Conversation } from '../types';
import { ConversationList } from '../components/conversations/ConversationList';
import { ConversationThread } from '../components/conversations/ConversationThread';
import { MessageSquare } from 'lucide-react';

export const Conversations: React.FC = () => {
  const [selected, setSelected] = useState<Conversation | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      <ConversationList selectedId={selected?.id ?? null} onSelect={setSelected} />

      <div className="flex-1 min-w-0 overflow-hidden">
        {selected ? (
          <ConversationThread
            key={selected.id}
            conversation={selected}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 bg-slate-50">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <MessageSquare size={32} className="text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Select a conversation</p>
              <p className="text-xs text-slate-400 mt-1">All guest messages across channels in one place</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
