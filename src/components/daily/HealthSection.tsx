import React from 'react';
import { Sparkles, Plus, Edit2, Moon, Droplets, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { HealthEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HealthSectionProps {
  health?: HealthEntry;
  onEdit: () => void;
  onToggleHabit: (habitId: string) => void;
  onCopyYesterdayHabits?: () => void;
  yesterdayHabitsCount?: number;
}

export const HealthSection: React.FC<HealthSectionProps> = ({
  health,
  onEdit,
  onToggleHabit,
  onCopyYesterdayHabits,
  yesterdayHabitsCount = 0,
}) => {
  const completedHabits = health?.habits?.filter((h) => h.completed).length || 0;
  const totalHabits = health?.habits?.length || 0;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white dark:text-white light:text-neutral-900">
              Health & Habits
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Circadian baseline, sleep duration, hydration & sovereign routines
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCopyYesterdayHabits && yesterdayHabitsCount > 0 && totalHabits === 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onCopyYesterdayHabits}
              icon={<RotateCcw className="w-3 h-3 text-[#FF7138]" />}
              className="text-xs font-mono"
            >
              Copy Yesterday's Habits ({yesterdayHabitsCount})
            </Button>
          )}
          {health && totalHabits > 0 && (
            <Badge variant="outline" size="sm">
              {completedHabits}/{totalHabits} Habits
            </Badge>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            icon={health ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          >
            {health ? 'Edit Vitals' : 'Log Health'}
          </Button>
        </div>
      </div>

      {health ? (
        <div className="p-5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white space-y-4 shadow-sm">
          {/* Key Vitals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200 flex items-center gap-3">
              <div className="p-2 rounded bg-[#181818] dark:bg-[#181818] light:bg-neutral-200 text-neutral-300 dark:text-white light:text-black">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Sleep Duration
                </span>
                <span className="text-sm font-mono font-semibold text-white dark:text-white light:text-neutral-900">
                  {health.sleepHours} hrs
                </span>
                {health.sleepQuality && (
                  <span className="text-[10px] font-mono text-neutral-500 ml-1">
                    ({health.sleepQuality})
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200 flex items-center gap-3">
              <div className="p-2 rounded bg-[#181818] dark:bg-[#181818] light:bg-neutral-200 text-neutral-300 dark:text-white light:text-black">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Water Hydration
                </span>
                <span className="text-sm font-mono font-semibold text-white dark:text-white light:text-neutral-900">
                  {health.waterIntakeLiters} L
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200 flex items-center gap-3">
              <div className="p-2 rounded bg-[#181818] dark:bg-[#181818] light:bg-neutral-200 text-neutral-300 dark:text-white light:text-black">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Habit Consistency
                </span>
                <span className="text-sm font-mono font-semibold text-white dark:text-white light:text-neutral-900">
                  {totalHabits > 0 ? `${Math.round((completedHabits / totalHabits) * 100)}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Habits Checklist */}
          {health.habits && health.habits.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold block">
                Daily Habits Checklist (Click to toggle)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {health.habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => onToggleHabit(habit.id)}
                    className="flex items-center gap-2.5 p-2.5 rounded border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50/70 hover:border-neutral-500 dark:hover:border-neutral-500 transition-colors text-left"
                  >
                    {habit.completed ? (
                      <CheckSquare className="w-4 h-4 text-white dark:text-white light:text-black shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-mono ${
                        habit.completed
                          ? 'line-through text-neutral-500 dark:text-neutral-500'
                          : 'text-neutral-300 dark:text-neutral-200 light:text-neutral-800'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom metrics */}
          {health.customMetrics && health.customMetrics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#181818] dark:border-[#181818] light:border-neutral-100">
              {health.customMetrics.map((cm) => (
                <div
                  key={cm.id}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 border border-[#222222] dark:border-[#222222] light:border-neutral-200 text-neutral-400"
                >
                  <span className="text-neutral-500">{cm.name}: </span>
                  <span className="font-semibold text-white dark:text-white light:text-neutral-900">
                    {cm.value} {cm.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 text-center space-y-3">
          <p className="text-xs font-mono text-neutral-500">
            No health vitals or habits documented for this day.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onCopyYesterdayHabits && yesterdayHabitsCount > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onCopyYesterdayHabits}
                icon={<RotateCcw className="w-3 h-3 text-[#FF7138]" />}
                className="text-xs font-mono"
              >
                Copy Yesterday's Habits ({yesterdayHabitsCount})
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              icon={<Plus className="w-3 h-3" />}
              className="text-xs font-mono"
            >
              Track Health & Habits
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
