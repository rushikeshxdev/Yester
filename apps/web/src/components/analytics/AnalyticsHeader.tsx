import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnalyticsHeaderProps {
  year: number;
  month?: number | null;
  totalEntries: number;
  activeDays: number;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  year,
  month,
  totalEntries,
  activeDays,
}) => {
  const periodLabel = month ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1E232B]">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#FF7138] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Life Analytics Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
          Your Journey in {periodLabel}
        </h1>
        <p className="text-sm font-sans text-neutral-400 mt-1">
          Explore cadence, domain balance, achievements and life plan trajectories
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 bg-[#111418] border border-[#20252D] px-4 py-2 rounded-xl self-start sm:self-auto">
        <span>Recorded: <strong className="text-white">{activeDays}</strong> days</span>
        <span className="text-neutral-600">•</span>
        <span>Logged: <strong className="text-[#FF7138]">{totalEntries}</strong> entries</span>
      </div>
    </div>
  );
};
