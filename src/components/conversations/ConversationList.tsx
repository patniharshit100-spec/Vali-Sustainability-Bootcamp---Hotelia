import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { mockConversations } from '../../data/mockData';
import type { Conversation } from '../../types';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { TabGroup } from '../common/TabGroup';

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
}

const tabs = [
  { id: 'all', label: 'All', count: 3 },
  { id: 'open', label: 'Open', count: 2 },
  { id: 'resolved', label: 'Resolved', count: 1 },
];

const channelColors: Record<string, string> = {
  email: 'bg-slate-100 text-slate-600',
  whatsapp: 'bg-green-100 text-green-700',
  booking: 'bg-blue-100 text-blue-700',
  expedia: 'bg-yellow-100 text-yellow-700',
  tripadvisor: 'bg-emerald-100 text-emerald-700',
  google: 'bg-red-100 text-red-700',
};

const channelLabels: Record<string, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  google: 'Google',
};

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelect }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockConversations.filter((c) => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch = !search || c.guestName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white w-80">
      <div className="p-3 border-b border-slate-200">
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left p-4 border-b border-slate-100 transition-colors ${
              selectedId === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar name={conv.guestName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800 truncate">{conv.guestName}</span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-1.5">{conv.lastMessage}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${channelColors[conv.channel]}`}>
                    {channelLabels[conv.channel]}
                  </span>
                  <Badge
                    variant={conv.status === 'open' ? 'warning' : 'success'}
                    size="sm"
                    dot
                  >
                    {conv.status}
                  </Badge>
                  {conv.unreadCount > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
