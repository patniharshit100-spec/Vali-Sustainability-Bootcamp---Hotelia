import React from 'react';
import { Star } from 'lucide-react';
import type { Competitor } from '../../types';

interface CompetitiveAnalysisProps {
  competitors: Competitor[];
}

export const CompetitiveAnalysis: React.FC<CompetitiveAnalysisProps> = ({ competitors }) => {
  const maxRate = Math.max(...competitors.map((c) => c.avgRate));

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Competitive Analysis</h3>
        <p className="text-xs text-slate-500 mt-0.5">Rate & performance benchmarking</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Hotel</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">Stars</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500">Avg Rate</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500">Occupancy</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {competitors.map((comp, idx) => (
              <tr
                key={comp.id}
                className={idx === 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
              >
                <td className="px-5 py-3">
                  <span className={`text-sm font-medium ${idx === 0 ? 'text-blue-700' : 'text-slate-700'}`}>
                    {comp.name}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="flex justify-center items-center gap-0.5">
                    {Array.from({ length: comp.stars }).map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <div>
                    <span className={`text-sm font-semibold ${idx === 0 ? 'text-blue-700' : 'text-slate-700'}`}>
                      ${comp.avgRate}
                    </span>
                    <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`}
                        style={{ width: `${(comp.avgRate / maxRate) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={`text-sm font-semibold ${comp.occupancy >= 85 ? 'text-green-600' : comp.occupancy >= 75 ? 'text-amber-600' : 'text-red-500'}`}>
                    {comp.occupancy}%
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-semibold text-slate-700">{comp.reviewScore}</span>
                  <span className="text-xs text-slate-400">/5</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
