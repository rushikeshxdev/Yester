import React from 'react';
import { Filter, Calendar, Layers } from 'lucide-react';

interface AnalyticsFilterBarProps {
  year: number;
  onYearChange: (year: number) => void;
  availableYears?: number[];
  month: number | null; // null = All
  onMonthChange: (month: number | null) => void;
  granularity: 'daily' | 'weekly' | 'monthly';
  onGranularityChange: (g: 'daily' | 'weekly' | 'monthly') => void;
  category: string; // 'ALL' or ActivityCategory
  onCategoryChange: (category: string) => void;
}

const MONTH_NAMES = [
  'All Months',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const CATEGORIES = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'work', label: 'Work' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'learning', label: 'Learning' },
  { key: 'personal', label: 'Personal' },
  { key: 'project', label: 'Projects' },
  { key: 'health', label: 'Health' },
];

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  year,
  onYearChange,
  availableYears = [2024, 2025, 2026, 2027],
  month,
  onMonthChange,
  granularity,
  onGranularityChange,
  category,
  onCategoryChange,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-sm flex flex-wrap items-center justify-between gap-4">
      {/* Left: Filter groups */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mr-1">
          <Filter className="w-3.5 h-3.5 text-[#FF7138]" />
          <span>Filters:</span>
        </div>

        {/* Year Select */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-xl bg-[#141820] border border-[#202632] text-xs font-mono text-white hover:border-[#FF7138]/50 focus:border-[#FF7138] focus:outline-none cursor-pointer appearance-none pr-8"
          >
            {availableYears.map((y) => (
              <option key={y} value={y} className="bg-[#12151B] text-white">
                Year: {y}
              </option>
            ))}
          </select>
          <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Month Select */}
        <div className="relative">
          <select
            value={month === null ? 0 : month}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onMonthChange(val === 0 ? null : val);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#141820] border border-[#202632] text-xs font-mono text-white hover:border-[#FF7138]/50 focus:border-[#FF7138] focus:outline-none cursor-pointer appearance-none pr-8"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx} className="bg-[#12151B] text-white">
                {name}
              </option>
            ))}
          </select>
          <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Category Select */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#141820] border border-[#202632] text-xs font-mono text-white hover:border-[#FF7138]/50 focus:border-[#FF7138] focus:outline-none cursor-pointer appearance-none pr-8"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key} className="bg-[#12151B] text-white">
                {c.label}
              </option>
            ))}
          </select>
          <Layers className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Right: Granularity Pill Selector */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141820] border border-[#202632]">
        {(['daily', 'weekly', 'monthly'] as const).map((g) => {
          const isActive = granularity === g;
          return (
            <button
              key={g}
              onClick={() => onGranularityChange(g)}
              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF7138] text-white shadow-sm font-medium'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
};
