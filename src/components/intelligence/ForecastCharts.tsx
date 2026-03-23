import React from 'react';
import { TrendingUp } from 'lucide-react';

const weeklyOccupancy = [
  { day: 'Mon', value: 72 },
  { day: 'Tue', value: 68 },
  { day: 'Wed', value: 81 },
  { day: 'Thu', value: 85 },
  { day: 'Fri', value: 94 },
  { day: 'Sat', value: 98 },
  { day: 'Sun', value: 87 },
];

const revenueData = [
  { week: 'W1', value: 42000 },
  { week: 'W2', value: 47500 },
  { week: 'W3', value: 44200 },
  { week: 'W4', value: 51800 },
];

export const ForecastCharts: React.FC = () => {
  const maxOcc = Math.max(...weeklyOccupancy.map((d) => d.value));
  const maxRev = Math.max(...revenueData.map((d) => d.value));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Occupancy Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Weekly Occupancy</h4>
            <p className="text-xs text-slate-500">Current week</p>
          </div>
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            <TrendingUp size={13} />
            <span className="text-xs font-semibold">+4.2%</span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-32">
          {weeklyOccupancy.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{d.value}%</span>
              <div
                className="w-full rounded-t-md bg-blue-500 transition-all"
                style={{ height: `${Math.round((d.value / maxOcc) * 80)}px` }}
              />
              <span className="text-xs text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Monthly Revenue</h4>
            <p className="text-xs text-slate-500">By week (USD)</p>
          </div>
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            <TrendingUp size={13} />
            <span className="text-xs font-semibold">+11.2%</span>
          </div>
        </div>
        <div className="flex items-end gap-4 h-32">
          {revenueData.map((d) => (
            <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">${(d.value / 1000).toFixed(1)}k</span>
              <div
                className="w-full rounded-t-md bg-violet-500 transition-all"
                style={{ height: `${Math.round((d.value / maxRev) * 80)}px` }}
              />
              <span className="text-xs text-slate-400">{d.week}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
