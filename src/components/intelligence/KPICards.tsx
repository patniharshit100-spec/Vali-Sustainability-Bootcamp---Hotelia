import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPI } from '../../types';

interface KPICardsProps {
  kpis: KPI[];
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 font-medium mb-2">{kpi.label}</p>
          <p className="text-2xl font-bold text-slate-800 mb-2">{kpi.value}</p>
          <div className="flex items-center gap-1.5">
            {kpi.trend === 'up' ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : kpi.trend === 'down' ? (
              <TrendingDown size={14} className="text-red-500" />
            ) : (
              <Minus size={14} className="text-slate-400" />
            )}
            <span
              className={`text-xs font-semibold ${
                kpi.trend === 'up'
                  ? 'text-green-600'
                  : kpi.trend === 'down'
                  ? 'text-red-600'
                  : 'text-slate-400'
              }`}
            >
              {kpi.change > 0 ? '+' : ''}{kpi.change}%
            </span>
            <span className="text-xs text-slate-400">{kpi.changeLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
