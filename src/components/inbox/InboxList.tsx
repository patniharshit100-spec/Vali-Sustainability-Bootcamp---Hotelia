import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useInboxStore } from '../../stores/inboxStore';
import { InboxItem } from './InboxItem';
import { TabGroup } from '../common/TabGroup';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread', count: 3 },
  { id: 'urgent', label: 'Urgent', count: 2 },
];

export const InboxList: React.FC = () => {
  const { messages, selectedMessageId, selectMessage, markAsRead } = useInboxStore();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = messages.filter((m) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !m.isRead) ||
      (activeTab === 'urgent' && m.isUrgent);
    const matchesSearch =
      !search ||
      m.guestName.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelect = (id: string) => {
    selectMessage(id);
    markAsRead(id);
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white">
      <div className="p-3 border-b border-slate-200">
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <Filter size={15} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <p className="text-sm">No messages found</p>
          </div>
        ) : (
          filtered.map((msg) => (
            <InboxItem
              key={msg.id}
              message={msg}
              isSelected={selectedMessageId === msg.id}
              onClick={() => handleSelect(msg.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
