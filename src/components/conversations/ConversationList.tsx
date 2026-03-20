import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, Mail, MessageCircle, Globe, Star } from 'lucide-react';
import { mockConversations } from '../../data/mockData';
import type { Conversation, MessageSource } from '../../types';
import { Avatar } from '../common/Avatar';

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
}

// ─── Channel config ────────────────────────────────────────────────────────────

const CHANNEL_ICON: Record<MessageSource, React.ReactNode> = {
  email: <Mail size={11} />,
  whatsapp: <MessageCircle size={11} />,
  booking: <Globe size={11} />,
  expedia: <Globe size={11} />,
  tripadvisor: <Star size={11} />,
  google: <Globe size={11} />,
};

const CHANNEL_PILL: Record<MessageSource, string> = {
  email: 'bg-slate-100 text-slate-600',
  whatsapp: 'bg-green-100 text-green-700',
  booking: 'bg-blue-100 text-blue-700',
  expedia: 'bg-yellow-100 text-yellow-800',
  tripadvisor: 'bg-emerald-100 text-emerald-700',
  google: 'bg-red-100 text-red-700',
};

const CHANNEL_LABEL: Record<MessageSource, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  booking: 'Booking.com',
  expedia: 'Expedia',
  tripadvisor: 'TripAdvisor',
  google: 'Google',
};

// ─── Status dot ───────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  waiting: 'bg-amber-400',
  resolved: 'bg-green-500',
};

// ─── Sort options ─────────────────────────────────────────────────────────────

type SortOption = 'recent' | 'unread' | 'urgent';

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Most Recent',
  unread: 'Unread First',
  urgent: 'Urgent First',
};

const URGENCY_ORDER: Record<string, number> = { urgent: 0, waiting: 1, resolved: 2 };

function sortConvs(convs: Conversation[], sort: SortOption): Conversation[] {
  return [...convs].sort((a, b) => {
    if (sort === 'unread') {
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
    }
    if (sort === 'urgent') {
      const ua = URGENCY_ORDER[a.urgency] ?? 1;
      const ub = URGENCY_ORDER[b.urgency] ?? 1;
      if (ua !== ub) return ua - ub;
    }
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });
}

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return `${Math.round(diffMs / 60000)}m`;
  if (diffH < 24 && d.toDateString() === now.toDateString()) return `${Math.round(diffH)}h`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelect }) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [sortOpen, setSortOpen] = useState(false);

  const processed = useMemo(() => {
    let list = mockConversations.filter((c) => {
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchSearch =
        !search ||
        c.guestName.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
    return sortConvs(list, sort);
  }, [search, sort, filterStatus]);

  const counts = useMemo(() => ({
    all: mockConversations.length,
    open: mockConversations.filter((c) => c.status === 'open').length,
    resolved: mockConversations.filter((c) => c.status === 'resolved').length,
  }), []);

  const totalUnread = mockConversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white w-full md:w-[30%] md:min-w-[260px] md:max-w-[380px] flex-shrink-0">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Conversations
            {totalUnread > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
                {totalUnread}
              </span>
            )}
          </h2>
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
            >
              {SORT_LABELS[sort]}
              <ChevronDown size={11} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSort(opt); setSortOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      sort === opt
                        ? 'text-blue-700 bg-blue-50 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'open', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                filterStatus === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}{' '}
              <span className={`text-xs ${filterStatus === tab ? 'text-blue-100' : 'text-slate-400'}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {processed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Search size={24} className="text-slate-200" />
            <p className="text-xs font-medium">No conversations found</p>
          </div>
        ) : (
          processed.map((conv) => {
            const isSelected = selectedId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-100 transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-l-[3px] border-l-blue-600'
                    : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with status dot */}
                  <div className="relative flex-shrink-0">
                    <Avatar name={conv.guestName} size="sm" />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${STATUS_DOT[conv.urgency]}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Row 1: name + time */}
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {conv.guestName}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-1">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>

                    {/* Row 2: last message preview */}
                    <p className={`text-xs leading-snug truncate mb-1.5 ${conv.unreadCount > 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                      {conv.lastMessage}
                    </p>

                    {/* Row 3: channel pills + unread badge */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* Deduplicated channel icons */}
                      {[...new Set(conv.channels)].map((ch) => (
                        <span
                          key={ch}
                          className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_PILL[ch]}`}
                        >
                          {CHANNEL_ICON[ch]}
                          <span className="hidden sm:inline">{CHANNEL_LABEL[ch]}</span>
                        </span>
                      ))}
                      {/* Unread badge */}
                      {conv.unreadCount > 0 && (
                        <span className="ml-auto flex-shrink-0 h-4 min-w-[16px] px-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
