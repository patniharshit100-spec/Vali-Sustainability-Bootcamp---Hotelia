import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Mail,
  MessageCircle,
  Globe,
  Star,
  Check,
  Pencil,
  UserPlus,
  AlertTriangle,
  Phone,
  Database,
} from 'lucide-react';
import { InboxSlidePanel } from '../components/inbox/InboxSlidePanel';
import { useCallStore, selectCallsToday } from '../stores/callStore';
import { useInboxStore } from '../stores/inboxStore';
import { useIntelligenceStore } from '../stores/intelligenceStore';
import { isSupabaseConfigured } from '../lib/supabase';
import type { CallRecord } from '../types/call';

// ─── Types ───────────────────────────────────────────────────────────────────

type UrgencyLevel = 'urgent' | 'pending' | 'info' | 'review';
type AIStatus = 'ai-ready' | 'action-required' | 'auto-resolved';
type FilterTab = 'all' | 'urgent' | 'needs-reply' | 'reviews' | 'auto-resolved';

interface InboxItem {
  id: string;
  urgency: UrgencyLevel;
  channel: 'email' | 'booking' | 'whatsapp' | 'tripadvisor';
  channelLabel: string;
  subject: string;
  preview: string;
  guestName: string;
  timestamp: string; // relative label
  aiStatus: AIStatus;
  aiDraftedReply?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INBOX_ITEMS: InboxItem[] = [
  {
    id: '1',
    urgency: 'urgent',
    channel: 'email',
    channelLabel: 'Email',
    subject: 'Refund request for cancelled stay May 15-17',
    preview: 'Hello, I had to cancel my reservation last minute due to a family emergency. I would like to request a full refund as per your cancellation policy...',
    guestName: 'M. Martin',
    timestamp: '30 min ago',
    aiStatus: 'ai-ready',
    aiDraftedReply:
      `Dear M. Martin,\n\nThank you for reaching out. We understand that unexpected situations arise and we are sorry to hear about your family emergency.\n\nWe have reviewed your reservation (May 15-17) and are pleased to confirm that a full refund of EUR 284 will be processed to your original payment method within 5-7 business days.\n\nWe hope to welcome you at a better time. Please do not hesitate to contact us if you need anything further.\n\nWarm regards,\nThe Grand Horizon Team`,
  },
  {
    id: '2',
    urgency: 'info',
    channel: 'booking',
    channelLabel: 'Booking.com',
    subject: 'New reservation - Double Room, June 10-12',
    preview: 'A new reservation has been confirmed for a Standard Double Room (June 10-12, 2 nights). Payment collected via Booking.com. Auto-confirmation sent.',
    guestName: 'L. Dubois',
    timestamp: '1h ago',
    aiStatus: 'auto-resolved',
  },
  {
    id: '3',
    urgency: 'pending',
    channel: 'whatsapp',
    channelLabel: 'WhatsApp',
    subject: 'Question about airport shuttle availability',
    preview: 'Hi! We land at 11pm on Friday. Do you offer a shuttle from the airport? How much does it cost and how do we book it?',
    guestName: 'K. Johansson',
    timestamp: '2h ago',
    aiStatus: 'ai-ready',
    aiDraftedReply:
      `Hi K. Johansson! Yes, we offer an airport shuttle service 24/7. The rate is EUR 35 per ride (up to 4 passengers). To book, just reply here with your flight number and we will confirm everything. See you Friday!`,
  },
  {
    id: '4',
    urgency: 'review',
    channel: 'tripadvisor',
    channelLabel: 'TripAdvisor',
    subject: '2-star review: "Noisy room and broken AC"',
    preview: '"Disappointing stay. The room next to ours was extremely noisy all night and the air conditioning stopped working on day 2. Staff were friendly but the issues were not resolved..."',
    guestName: 'Jean M.',
    timestamp: '3h ago',
    aiStatus: 'ai-ready',
    aiDraftedReply:
      `Dear Jean M.,\n\nThank you for taking the time to share your feedback. We sincerely apologise for the noise disturbance and the air conditioning issue you experienced - this is not the standard we hold ourselves to.\n\nWe have addressed both concerns with our maintenance and operations teams. We would love the opportunity to make this right. Please reach out to us directly so we can offer a gesture of goodwill for your next stay.\n\nSincerely,\nThe Grand Horizon Management`,
  },
  {
    id: '5',
    urgency: 'pending',
    channel: 'email',
    channelLabel: 'Email',
    subject: 'Group booking inquiry - 5 rooms, August',
    preview: 'Hello, we are organising a corporate retreat for 10 people in August (likely 14-17). Could you provide group rates for 5 rooms and any available meeting facilities?',
    guestName: 'C. Lefebvre',
    timestamp: '5h ago',
    aiStatus: 'action-required',
  },
];

// ─── KPI data ─────────────────────────────────────────────────────────────────

const KPIS = [
  { id: 'occ',     label: 'Occupancy Rate',     value: '78%',     trend: '+5%',  trendUp: true },
  { id: 'rev',     label: 'Avg Revenue / Room',  value: 'EUR 142', trend: '+3%',  trendUp: true },
  { id: 'score',   label: 'Review Score',        value: '4.3 / 5', trend: '+0.2', trendUp: true },
  { id: 'actions', label: 'Pending Actions',     value: 12,        trend: null,   trendUp: false },
];

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const TABS: { id: FilterTab; label: string; count: number }[] = [
  { id: 'all',           label: 'All',           count: 5 },
  { id: 'urgent',        label: 'Urgent',        count: 1 },
  { id: 'needs-reply',   label: 'Needs Reply',   count: 2 },
  { id: 'reviews',       label: 'Reviews',       count: 1 },
  { id: 'auto-resolved', label: 'Auto-Resolved', count: 1 },
];

function matchesTab(item: InboxItem, tab: FilterTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'urgent') return item.urgency === 'urgent';
  if (tab === 'needs-reply') return item.urgency === 'pending';
  if (tab === 'reviews') return item.urgency === 'review';
  if (tab === 'auto-resolved') return item.aiStatus === 'auto-resolved';
  return true;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const URGENCY_BAR: Record<UrgencyLevel, string> = {
  urgent:  'bg-red-500',
  pending: 'bg-amber-400',
  info:    'bg-blue-500',
  review:  'bg-amber-400',
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email:       <Mail size={13} />,
  booking:     <Globe size={13} />,
  whatsapp:    <MessageCircle size={13} />,
  tripadvisor: <Star size={13} />,
};

const CHANNEL_COLORS: Record<string, string> = {
  email:       'bg-slate-100 text-slate-600',
  booking:     'bg-blue-100 text-blue-700',
  whatsapp:    'bg-green-100 text-green-700',
  tripadvisor: 'bg-emerald-100 text-emerald-700',
};

const AI_BADGE: Record<AIStatus, { label: string; className: string }> = {
  'ai-ready':       { label: 'AI Reply Ready',  className: 'bg-blue-100 text-blue-700' },
  'action-required':{ label: 'Action Required', className: 'bg-red-100 text-red-600' },
  'auto-resolved':  { label: 'Auto-Resolved',   className: 'bg-green-100 text-green-700' },
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-in fade-in">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 flex-shrink-0">
        <Check size={12} />
      </span>
      {message}
    </div>
  );
}

// ─── Inbox card ────────────────────────────────────────────────────────────────

function InboxCard({
  item,
  onApprove,
  onEdit,
}: {
  item: InboxItem;
  onApprove: (id: string) => void;
  onEdit: (item: InboxItem) => void;
}) {
  const aiBadge = AI_BADGE[item.aiStatus];

  return (
    <div
      onClick={() => onEdit(item)}
      className="flex bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      {/* Urgency bar */}
      <div className={`w-1 flex-shrink-0 ${URGENCY_BAR[item.urgency]}`} />

      {/* Content */}
      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            {/* Channel + timestamp row */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CHANNEL_COLORS[item.channel]}`}>
                {CHANNEL_ICONS[item.channel]}
                {item.channelLabel}
              </span>
              <span className="text-xs text-slate-400">{item.timestamp}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ml-auto ${aiBadge.className}`}>
                {aiBadge.label}
              </span>
            </div>

            {/* Subject */}
            <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">{item.subject}</p>

            {/* Preview */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.preview}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {item.aiStatus === 'ai-ready' && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(item.id); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Check size={12} />
              Approve AI Reply
            </button>
          )}
          {item.aiStatus !== 'auto-resolved' && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Pencil size={12} />
              Edit & Reply
            </button>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
          >
            <UserPlus size={12} />
            Assign
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Call inbox card ──────────────────────────────────────────────────────────
// Visually matches InboxCard: same white card, border, padding, font sizes.
// Purple left bar and badge distinguish it as a phone call.

function formatCallAge(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CallInboxCard({
  call,
  onView,
}: {
  call: CallRecord;
  onView: () => void;
}) {
  const callerLabel =
    call.direction === 'inbound'
      ? (call.callerName ?? call.callerPhone ?? 'Unknown Caller')
      : (call.vendorName ?? call.vendorPhone ?? 'Vendor');

  const subject =
    call.status === 'missed'
      ? `Missed call — ${callerLabel}`
      : (call.summary ?? `Call with ${callerLabel}`);

  // First transcript line makes a more useful preview than a static string
  const preview =
    call.transcript[0]?.content ??
    call.summary ??
    'No transcript available.';

  const statusBadge =
    call.status === 'missed'
      ? { label: 'Missed', className: 'bg-red-100 text-red-600' }
      : { label: 'Needs Review', className: 'bg-purple-100 text-purple-700' };

  return (
    <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all">
      {/* Purple urgency bar — matches the 4px bar on InboxCard */}
      <div className="w-1 flex-shrink-0 bg-purple-500" />

      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Channel + timestamp row */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <Phone size={13} />
                Call
              </span>
              <span className="text-xs text-slate-400">{formatCallAge(call.startTime)}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ml-auto ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* Subject */}
            <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">{subject}</p>

            {/* Preview */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{preview}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Phone size={12} />
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();

  // ── Supabase stores ──────────────────────────────────────────────────────
  const inboxLoading     = useInboxStore((s) => s.loading);
  const approveAIReply   = useInboxStore((s) => s.approveAIReply);
  const liveKpis         = useIntelligenceStore((s) => s.kpis);
  const kpisLoading      = useIntelligenceStore((s) => s.loading);
  const isDemo           = !isSupabaseConfigured();

  // ── Call Center live data ────────────────────────────────────────────────
  const activeCall    = useCallStore((s) => s.activeCall);
  const callHistory   = useCallStore((s) => s.callHistory);
  const callsToday    = useCallStore(selectCallsToday);

  // Calls that ended without a linked task — surface in inbox
  const unresolvedCalls = callHistory.filter(
    (c) => (c.status === 'ended' || c.status === 'missed') && !c.linkedTaskId,
  );

  // Last recorded sentiment for the trend badge on the KPI card
  const lastSentiment = callHistory
    .filter((c) => c.sentiment !== undefined)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0]
    ?.sentiment;

  // ── Existing page state ──────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState<FilterTab>('all');
  const [toast,       setToast]       = useState<string | null>(null);
  const [replyItem,   setReplyItem]   = useState<InboxItem | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  const handleApprove = async (id: string) => {
    setApprovedIds((prev) => new Set(prev).add(id));
    await approveAIReply(id);
    setToast('AI reply sent successfully!');
  };

  const handlePanelSend = (itemId: string, _text: string, channel: string) => {
    setApprovedIds((prev) => new Set(prev).add(itemId));
    setReplyItem(null);
    setToast(`Reply sent via ${channel}!`);
  };

  const visibleItems = INBOX_ITEMS.filter(
    (item) => matchesTab(item, activeTab) && !approvedIds.has(item.id),
  );

  // ── Call Center KPI card content ─────────────────────────────────────────

  const callsTodayCount = callsToday.length;

  // Sentiment trend badge — matches the green pill style used on other KPI cards
  const sentimentBadge = (() => {
    if (!lastSentiment) {
      return (
        <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex-shrink-0">
          <span className="text-xs font-semibold">— None yet</span>
        </div>
      );
    }
    if (lastSentiment === 'positive') {
      return (
        <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg flex-shrink-0">
          <TrendingUp size={13} />
          <span className="text-xs font-semibold">Positive</span>
        </div>
      );
    }
    if (lastSentiment === 'negative') {
      return (
        <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg flex-shrink-0">
          <TrendingDown size={13} />
          <span className="text-xs font-semibold">Negative</span>
        </div>
      );
    }
    // neutral
    return (
      <div className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-lg flex-shrink-0">
        <span className="text-xs font-semibold">Neutral</span>
      </div>
    );
  })();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full overflow-y-auto"><div className="p-6 space-y-6">
      {/* Demo mode banner */}
      {isDemo && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
          <Database size={16} className="flex-shrink-0 text-amber-600" />
          <p className="text-sm font-medium">
            Demo mode — not connected to database. Add{' '}
            <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code>{' '}
            and{' '}
            <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>{' '}
            to your <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">.env</code> to connect.
          </p>
        </div>
      )}

      {/* AI Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold mb-1">Good morning, Maria!</h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              You have{' '}
              <strong className="text-white">1 urgent message</strong> requiring immediate attention,{' '}
              <strong className="text-white">2 items</strong> awaiting your reply, and occupancy is up{' '}
              <strong className="text-white">5%</strong> this week. Great momentum — let's keep it going!
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: KPI Bar ── */}
      {/*
        Grid: 2 cols on mobile, 3 on md, 5 on xl.
        The 5th card (Call Center) is appended inside the same grid — identical
        card style (bg-white rounded-xl border border-slate-200 p-5).
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* KPI cards — live from intelligenceStore, skeleton while loading */}
        {kpisLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
                <div className="h-7 w-16 bg-slate-100 rounded" />
              </div>
            ))
          : liveKpis.map((kpi) => (
              <div key={kpi.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500 font-medium mb-2">{kpi.label}</p>

                <div className="flex items-end justify-between gap-2">
                  <p className="text-2xl font-bold text-slate-800 leading-none">
                    {kpi.id === 'pending-actions' ? (
                      <span className="flex items-center gap-2">
                        {kpi.value}
                        {parseInt(kpi.value, 10) > 5 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={11} />
                            High
                          </span>
                        )}
                      </span>
                    ) : (
                      kpi.value
                    )}
                  </p>

                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0 ${
                    kpi.trend === 'up' ? 'bg-green-50 text-green-600' :
                    kpi.trend === 'down' ? 'bg-red-50 text-red-500' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {kpi.trend === 'up' && <TrendingUp size={13} />}
                    {kpi.trend === 'down' && <TrendingDown size={13} />}
                    <span className="text-xs font-semibold">{kpi.changeLabel}</span>
                  </div>
                </div>
              </div>
            ))
        }

        {/* 5th card: Call Center — identical card shell, live data from callStore */}
        <div
          onClick={() => navigate('/call-center')}
          className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
        >
          <p className="text-xs text-slate-500 font-medium mb-2">Call Center</p>

          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-slate-800 leading-none">
              {callsTodayCount} {callsTodayCount === 1 ? 'Call' : 'Calls'}
            </p>
            {sentimentBadge}
          </div>

          {/* Active / Idle status indicator — sits where the trend row sits on other cards */}
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                activeCall ? 'bg-green-500' : 'bg-slate-300'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                activeCall ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              {activeCall ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Action Inbox ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-800">Action Inbox</h2>
          <span className="text-xs text-slate-400">{INBOX_ITEMS.length} items total</span>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-4 overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-500'
                } ${tab.id === 'urgent' ? '!bg-red-100 !text-red-600' : ''}`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {inboxLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
                <div className="w-1 bg-slate-100 flex-shrink-0" />
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-slate-100 rounded-full" />
                    <div className="h-4 w-12 bg-slate-100 rounded-full" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            ))
          ) : visibleItems.length === 0 && unresolvedCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 gap-2">
              <Check size={24} className="text-slate-300" />
              <p className="text-sm font-medium text-slate-500">All clear in this category</p>
              <p className="text-xs">No items to action here right now.</p>
            </div>
          ) : (
            <>
              {visibleItems.map((item) => (
                <InboxCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onEdit={setReplyItem}
                />
              ))}

              {/* Call inbox items — only on the "All" tab, only when there are unresolved calls */}
              {activeTab === 'all' && unresolvedCalls.map((call) => (
                <CallInboxCard
                  key={call.id}
                  call={call}
                  onView={() => navigate('/call-center')}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Reply slide panel */}
      <InboxSlidePanel
        item={replyItem}
        onClose={() => setReplyItem(null)}
        onSend={handlePanelSend}
      />
    </div></div>
  );
};
