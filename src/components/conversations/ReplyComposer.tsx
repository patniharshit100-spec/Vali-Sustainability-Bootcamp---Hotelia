import React, { useState } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';

interface ReplyComposerProps {
  onSend: (text: string) => void;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a reply... (⌘Enter to send)"
          className="w-full px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none min-h-[80px]"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
              <Paperclip size={16} />
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors">
              <Sparkles size={14} />
              AI Suggest
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
