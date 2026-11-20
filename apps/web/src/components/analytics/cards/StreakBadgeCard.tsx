import React from 'react';
import { Flame, Trophy, CalendarCheck } from 'lucide-react';

interface StreakBadgeCardProps {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalDays: number;
}

export const StreakBadgeCard: React.FC<StreakBadgeCardProps> = ({
  currentStreak,
  longestStreak,
  activeDays,
  totalDays,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-sm relative overflow-hidden group hover:border-[#2A313D] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#161A22] border border-[#232934] flex items-center justify-center text-[#FF7138]">
          <Flame className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF7138]/10 border border-[#FF7138]/20 text-[11px] font-mono text-[#FF7138]">
          <Trophy className="w-3.5 h-3.5" />
          <span>Best: {longestStreak} days</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
              {currentStreak}
            </h3>
            <span className="text-sm font-sans text-neutral-400">
              {currentStreak === 1 ? 'day streak' : 'days streak'}
            </span>
          </div>
          <p className="text-xs font-sans text-neutral-400 mt-0.5">
            Consecutive recording cadence
          </p>
        </div>

        <div className="pt-2 border-t border-[#1E232B] flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-[#FF7138]" />
            <span>Active Days:</span>
          </span>
          <span className="text-white font-medium">
            {activeDays} <span className="text-neutral-500">/ {totalDays}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
