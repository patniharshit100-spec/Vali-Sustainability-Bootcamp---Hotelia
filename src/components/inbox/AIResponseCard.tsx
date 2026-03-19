import React, { useState } from 'react';
import { Sparkles, Copy, Check, Send, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface AIResponseCardProps {
  suggestion: string;
  onSend: (text: string) => void;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({ suggestion, onSend }) => {
  const [text, setText] = useState(suggestion);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 bg-blue-600 rounded-md flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-blue-800">AI Suggested Reply</span>
        <span className="ml-auto text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Ready to send</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full text-sm text-slate-700 bg-white border border-blue-200 rounded-lg p-3 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={14} />}
          className="text-slate-500"
        >
          Regenerate
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Send size={14} />}
          onClick={() => onSend(text)}
          className="ml-auto"
        >
          Send Reply
        </Button>
      </div>
    </div>
  );
};
