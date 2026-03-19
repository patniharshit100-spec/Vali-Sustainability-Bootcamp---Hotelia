import React from 'react';
import { mockKPIs, mockReviews, mockCompetitors } from '../data/mockData';
import { KPICards } from '../components/intelligence/KPICards';
import { ReviewPanel } from '../components/intelligence/ReviewPanel';
import { CompetitiveAnalysis } from '../components/intelligence/CompetitiveAnalysis';
import { ForecastCharts } from '../components/intelligence/ForecastCharts';

export const Intelligence: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Performance KPIs</h2>
        <KPICards kpis={mockKPIs} />
      </section>

      {/* Charts */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Trends & Forecast</h2>
        <ForecastCharts />
      </section>

      {/* Competitive + Reviews side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Competitive Landscape</h2>
          <CompetitiveAnalysis competitors={mockCompetitors} />
        </section>
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Guest Reviews</h2>
          <ReviewPanel reviews={mockReviews} />
        </section>
      </div>
    </div>
  );
};
