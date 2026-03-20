import React, { useState } from 'react';
import type { Conversation } from '../types';
import { ConversationList } from '../components/conversations/ConversationList';
import { ConversationThread } from '../components/conversations/ConversationThread';
import { MessageSquare } from 'lucide-react';

export const Conversations: React.FC = () => {
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');

  const handleSelect = (conv: Conversation) => {
    setSelected(conv);
    setMobileView('thread');
  };

  const handleBack = () => {
    setMobileView('list');
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: hidden on mobile when thread is open */}
      <div className={`${mobileView === 'thread' ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-auto`}>
        <ConversationList selectedId={selected?.id ?? null} onSelect={handleSelect} />
      </div>

      {/* Right panel: hidden on mobile when list is shown */}
      <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 min-w-0 overflow-hidden flex-col`}>
        {selected ? (
          <ConversationThread
            key={selected.id}
            conversation={selected}
            onBack={handleBack}
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
