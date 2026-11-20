import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '../../../config/categoryTheme';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  weekday: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  weekIndex: number;
  count: number;
  intensity: number; // 0 = 0, 1 = 1-2, 2 = 3-4, 3 = 5-6, 4 = 7+
  categories?: Record<string, number>;
}

interface ActivityHeatmapProps {
  year: number;
  totalDays: number;
  activeDays: number;
  maxDayEntries: number;
  startWeekday: number;
  totalWeeks: number;
  heatmap: HeatmapDay[];
  weekdayDistribution?: Record<string, number>;
  onDateClick?: (date: string) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Signal Orange intensity palette
const INTENSITY_COLORS: Record<number, string> = {
  0: '#14171E', // Base empty cell
  1: 'rgba(255, 113, 56, 0.28)',
  2: 'rgba(255, 113, 56, 0.52)',
  3: 'rgba(255, 113, 56, 0.78)',
  4: '#FF7138', // Peak Signal Orange
};

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  year,
  totalDays,
  activeDays,
  maxDayEntries,
  startWeekday: _startWeekday,
  totalWeeks,
  heatmap,
  weekdayDistribution,
  onDateClick,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Group days by weekIndex (0..totalWeeks - 1)
  const weeksMatrix: (HeatmapDay | null)[][] = Array.from({ length: totalWeeks }, () =>
    Array(7).fill(null)
  );

  for (const day of heatmap) {
    if (day.weekIndex >= 0 && day.weekIndex < totalWeeks && day.weekday >= 0 && day.weekday < 7) {
      weeksMatrix[day.weekIndex][day.weekday] = day;
    }
  }

  // Calculate approximate month column indices for header labels
  const monthLabels: { month: string; colIndex: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < totalWeeks; w++) {
    const day = weeksMatrix[w].find((d) => d !== null);
    if (day) {
      const monthIdx = parseInt(day.date.slice(5, 7), 10) - 1;
      if (monthIdx !== lastMonth) {
        monthLabels.push({ month: MONTH_NAMES[monthIdx], colIndex: w });
        lastMonth = monthIdx;
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E232B]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF7138]" />
            <h3 className="text-xl font-serif text-white tracking-tight">
              Annual Activity Calendar
            </h3>
          </div>
          <p className="text-xs font-sans text-neutral-400 mt-1">
            {activeDays} active days across {totalDays} calendar days in {year} • Click any date to open journal
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 self-start sm:self-auto">
          <span className="text-[11px]">Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="w-3.5 h-3.5 rounded-sm border border-[#232934] inline-block"
              style={{ backgroundColor: INTENSITY_COLORS[level] }}
              title={`Level ${level}`}
            />
          ))}
          <span className="text-[11px]">More</span>
        </div>
      </div>

      {/* Contribution Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[760px] space-y-2">
          {/* Month labels row */}
          <div className="flex ml-8 text-[11px] font-mono text-neutral-400 relative h-4">
            {monthLabels.map(({ month, colIndex }) => (
              <span
                key={`${month}-${colIndex}`}
                className="absolute"
                style={{ left: `${colIndex * 14}px` }}
              >
                {month}
              </span>
            ))}
          </div>

          {/* Grid with Weekday Labels on Left */}
          <div className="flex gap-2">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between py-0.5 text-[10px] font-mono text-neutral-500 w-6 select-none">
              <span className="h-3 leading-3">Sun</span>
              <span className="h-3 leading-3 opacity-0">Mon</span>
              <span className="h-3 leading-3">Tue</span>
              <span className="h-3 leading-3 opacity-0">Wed</span>
              <span className="h-3 leading-3">Thu</span>
              <span className="h-3 leading-3 opacity-0">Fri</span>
              <span className="h-3 leading-3">Sat</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeksMatrix.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${wIdx}-${dIdx}`}
                          className="w-3 h-3 rounded-[2px] bg-transparent opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const isHovered = hoveredDay?.date === day.date;
                    const bg = INTENSITY_COLORS[day.intensity] || INTENSITY_COLORS[0];

                    return (
                      <div
                        key={day.date}
                        onClick={() => onDateClick && onDateClick(day.date)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-[2px] border transition-all cursor-pointer relative ${
                          isHovered
                            ? 'border-white scale-125 z-10 shadow-lg'
                            : 'border-[#1C212A] hover:border-[#FF7138]/60'
                        }`}
                        style={{ backgroundColor: bg }}
                        aria-label={`${day.date}: ${day.count} entries`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Info & Details Bar */}
      <div className="p-4 rounded-xl bg-[#141820] border border-[#202632] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        {hoveredDay ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-white font-medium">
              {hoveredDay.date} ({WEEKDAYS[hoveredDay.weekday]}):
            </span>
            <span className="text-[#FF7138] font-semibold">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'entry' : 'entries'}
            </span>
            {hoveredDay.categories && Object.keys(hoveredDay.categories).length > 0 && (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-700/60">
                {Object.entries(hoveredDay.categories).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      color: getCategoryColor(cat),
                      backgroundColor: `${getCategoryColor(cat)}15`,
                    }}
                  >
                    <span>{getCategoryLabel(cat)}:</span>
                    <span className="font-bold">{count}</span>
                  </span>
                ))}
              </div>
            )}
            <span className="text-neutral-500 text-[11px] hidden sm:inline">
              (Click to open journal)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-neutral-400">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span>Hover over any calendar cell to view date telemetry and entry distribution</span>
          </div>
        )}

        <div className="text-neutral-400 text-[11px] whitespace-nowrap self-end sm:self-auto">
          Peak Day: <span className="text-white font-medium">{maxDayEntries} entries</span>
        </div>
      </div>

      {/* Weekday Distribution Pills */}
      {weekdayDistribution && (
        <div className="pt-2 border-t border-[#1E232B] space-y-2">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Weekday Distribution
          </span>
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((w) => {
              const count = weekdayDistribution[w] || 0;
              return (
                <div
                  key={w}
                  className="p-2.5 rounded-xl bg-[#141820] border border-[#202632] text-center space-y-0.5"
                >
                  <div className="text-[11px] font-mono text-neutral-400">{w}</div>
                  <div className="text-sm font-mono font-semibold text-white">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
