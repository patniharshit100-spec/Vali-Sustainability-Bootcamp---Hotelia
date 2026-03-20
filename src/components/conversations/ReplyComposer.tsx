import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Sparkles, ChevronDown, Check, Zap } from 'lucide-react';
import type { MessageSource } from '../../types';

interface ReplyComposerProps {
  onSend: (text: string, channel: MessageSource) => void;
  defaultChannel?: MessageSource;
  aiSuggested?: string;
}

// ─── Channel options ──────────────────────────────────────────────────────────

type ChannelOption = { value: MessageSource; label: string; color: string };

const CHANNELS: ChannelOption[] = [
  { value: 'email', label: 'Email', color: 'text-slate-700' },
  { value: 'whatsapp', label: 'WhatsApp', color: 'text-green-700' },
  { value: 'booking', label: 'Booking.com', color: 'text-blue-700' },
  { value: 'expedia', label: 'Expedia', color: 'text-yellow-700' },
  { value: 'tripadvisor', label: 'TripAdvisor', color: 'text-emerald-700' },
];

// ─── Quick reply chips ────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  { id: 'checkin', label: 'Check-in at 14:00', text: "Check-in time is 14:00. Early check-in may be available \u2014 please let us know your arrival time and we'll do our best to accommodate you." },
  { id: 'parking', label: 'Yes, we have parking', text: 'Yes, we have on-site parking available at €15/night. Spaces can be reserved in advance — just let us know.' },
  { id: 'breakfast', label: 'Breakfast 7–10am', text: 'Breakfast is served daily from 7:00am to 10:00am in the Grand Dining Room on the ground floor. It is included in your rate.' },
  { id: 'checkout', label: 'Checkout at 11:00', text: 'Standard checkout time is 11:00. Late checkout until 13:00 may be available subject to occupancy — please ask at reception on the day.' },
  { id: 'pool', label: 'Pool open 8am–10pm', text: 'Our outdoor pool is open daily from 8:00am to 10:00pm. Towels are provided poolside.' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  onSend,
  defaultChannel = 'email',
  aiSuggested,
}) => {
  const [text, setText] = useState('');
  const [channel, setChannel] = useState<MessageSource>(defaultChannel);
  const [channelOpen, setChannelOpen] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset channel when defaultChannel prop changes (new conversation selected)
  React.useEffect(() => {
    setChannel(defaultChannel);
    setText('');
    setAiState('idle');
  }, [defaultChannel]);

  const handleSend = () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setTimeout(() => {
      onSend(text, channel);
      setText('');
      setAiState('idle');
      setSending(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
  };

  const handleGenerateAI = useCallback(() => {
    if (!aiSuggested || aiState === 'loading') return;
    setAiState('loading');
    setTimeout(() => {
      setText(aiSuggested);
      setAiState('loaded');
      textareaRef.current?.focus();
    }, 800);
  }, [aiSuggested, aiState]);

  const handleQuickReply = (qrText: string) => {
    setText(qrText);
    textareaRef.current?.focus();
  };

  const selectedChannel = CHANNELS.find((c) => c.value === channel) ?? CHANNELS[0];

  return (
    <div className="border-t border-slate-200 bg-white flex-shrink-0">
      {/* ── Quick reply chips ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 flex-shrink-0 flex items-center gap-1">
          <Zap size={11} />
          Quick:
        </span>
        {QUICK_REPLIES.map((qr) => (
          <button
            key={qr.id}
            onClick={() => handleQuickReply(qr.text)}
            className="flex-shrink-0 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            {qr.label}
          </button>
        ))}
      </div>

      {/* ── Composer box ──────────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply… (⌘Enter to send)"
            rows={3}
            className="w-full px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none placeholder-slate-300 min-h-[80px]"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-t border-slate-200">
            {/* Attachment */}
            <button
              title="Attach file"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
            >
              <Paperclip size={15} />
            </button>

            {/* Generate AI Reply */}
            <button
              onClick={handleGenerateAI}
              disabled={!aiSuggested || aiState === 'loading'}
              title={aiSuggested ? 'Generate AI reply' : 'No AI suggestion available'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                aiState === 'loaded'
                  ? 'bg-green-100 text-green-700'
                  : aiState === 'loading'
                  ? 'bg-blue-50 text-blue-500 cursor-wait'
                  : aiSuggested
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {aiState === 'loading' ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
                  Generating…
                </>
              ) : aiState === 'loaded' ? (
                <>
                  <Check size={13} />
                  AI Draft Loaded
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Generate AI Reply
                </>
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Channel selector */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setChannelOpen((o) => !o)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <span className={selectedChannel.color}>{selectedChannel.label}</span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>
              {channelOpen && (
                <div className="absolute bottom-full mb-1 right-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.value}
                      onClick={() => { setChannel(ch.value); setChannelOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                        ch.value === channel
                          ? 'bg-blue-50 font-semibold'
                          : 'hover:bg-slate-50'
                      } ${ch.color}`}
                    >
                      {ch.label}
                      {ch.value === channel && <Check size={11} className="ml-auto text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? (
                <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Send size={13} />
              )}
              Send
            </button>
          </div>
        </div>

        {/* Shortcut hint */}
        <p className="text-xs text-slate-400 mt-1.5 text-right">
          ⌘ Enter to send
        </p>
      </div>
    </div>
  );
};
