import React from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ConnectionStatus: React.FC = () => {
  const live = isSupabaseConfigured();
  return (
    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
      <div className={`h-2 w-2 rounded-full ${live ? 'bg-green-500' : 'bg-amber-400'}`} />
      <span className="text-xs font-medium text-slate-500">{live ? 'Live' : 'Demo Mode'}</span>
    </div>
  );
};
