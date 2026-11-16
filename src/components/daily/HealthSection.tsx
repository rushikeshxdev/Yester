import React from 'react';
import { Sparkles, Plus, Edit2, Moon, Droplets, CheckSquare, Square } from 'lucide-react';
import { HealthEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HealthSectionProps {
  health?: HealthEntry;
  onEdit: () => void;
  onToggleHabit: (habitId: string) => void;
}

export const HealthSection: React.FC<HealthSectionProps> = ({
  health,
  onEdit,
  onToggleHabit,
}) => {
  const completedHabits = health?.habits?.filter((h) => h.completed).length || 0;
  const totalHabits = health?.habits?.length || 0;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-neutral-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Health & Habits
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Circadian rhythm, hydration, sovereign routines & biological baseline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {health && totalHabits > 0 && (
            <Badge variant="outline" size="sm">
              {completedHabits}/{totalHabits} Habits
            </Badge>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            icon={health ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {health ? 'Edit Metrics' : 'Log Health'}
          </Button>
        </div>
      </div>

      {health ? (
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#131313] space-y-4 shadow-sm">
          {/* Key Vitals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222] flex items-center gap-3">
              <div className="p-2 rounded bg-neutral-200 dark:bg-[#252525] text-neutral-800 dark:text-white">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Sleep Duration
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                  {health.sleepHours} hrs
                </span>
                {health.sleepQuality && (
                  <span className="text-[11px] font-mono text-neutral-500 ml-1">
                    ({health.sleepQuality})
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222] flex items-center gap-3">
              <div className="p-2 rounded bg-neutral-200 dark:bg-[#252525] text-neutral-800 dark:text-white">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Water Hydration
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                  {health.waterIntakeLiters} L
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222] flex items-center gap-3">
              <div className="p-2 rounded bg-neutral-200 dark:bg-[#252525] text-neutral-800 dark:text-white">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                  Habit Consistency
                </span>
                <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
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
                    className="flex items-center gap-2.5 p-2.5 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#181818] hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors text-left"
                  >
                    {habit.completed ? (
                      <CheckSquare className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-mono ${
                        habit.completed
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-800 dark:text-neutral-200'
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
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100 dark:border-[#1E1E1E]">
              {health.customMetrics.map((cm) => (
                <div
                  key={cm.id}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-[#1C1C1C] border border-neutral-200 dark:border-[#282828] text-neutral-700 dark:text-neutral-300"
                >
                  <span className="text-neutral-500">{cm.name}: </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {cm.value} {cm.unit || ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No health metrics or habits tracked for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Track Health & Habits
          </Button>
        </div>
      )}
    </section>
  );
};

