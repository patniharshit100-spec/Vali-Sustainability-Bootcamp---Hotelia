import React, { useState } from 'react';
import { Phone, Delete } from 'lucide-react';
import { useCallStore } from '../../stores/callStore';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#'],
];

export const OutboundDialer: React.FC = () => {
  const { startCall, activeCall } = useCallStore();
  const [digits, setDigits] = useState('');
  const [label, setLabel] = useState('');

  const press = (key: string) => setDigits((d) => (d.length < 15 ? d + key : d));
  const backspace = () => setDigits((d) => d.slice(0, -1));

  const dial = () => {
    if (!digits || activeCall) return;
    startCall(label || 'Unknown Caller', digits, 'outbound');
    setDigits('');
    setLabel('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Outbound Dialer</h3>

      {/* Name / label */}
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Caller name (optional)"
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
      />

      {/* Display */}
      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 mb-4 min-h-[48px]">
        <span className="text-xl font-mono tracking-widest text-slate-800 flex-1">
          {digits || <span className="text-slate-300 text-base font-sans">Enter number…</span>}
        </span>
        {digits && (
          <button onClick={backspace} className="text-slate-400 hover:text-slate-600 transition-colors ml-2">
            <Delete size={18} />
          </button>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {KEYS.flat().map((key) => (
          <button
            key={key}
            onClick={() => press(key)}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-lg transition-colors active:scale-95"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Dial button */}
      <button
        onClick={dial}
        disabled={!digits || !!activeCall}
        className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Phone size={18} />
        {activeCall ? 'Call in progress' : 'Dial'}
      </button>
    </div>
  );
};
