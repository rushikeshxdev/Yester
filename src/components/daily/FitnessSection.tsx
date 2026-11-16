import React from 'react';
import { Dumbbell, Plus, Edit2, Trash2, Award, Timer } from 'lucide-react';
import { FitnessEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface FitnessSectionProps {
  entries: FitnessEntry[];
  onAdd: () => void;
  onEdit: (entry: FitnessEntry) => void;
  onDelete: (entryId: string) => void;
}

export const FitnessSection: React.FC<FitnessSectionProps> = ({
  entries,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-neutral-200">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Physical & Fitness
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Strength, cardiovascular performance, recovery & personal records
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Session' : 'Sessions'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Workout
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#131313] hover:border-neutral-300 dark:hover:border-[#303030] transition-colors space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">
                    {entry.workoutType}
                  </span>
                  <Badge variant="active" size="sm">
                    {entry.workoutDurationMinutes} mins
                  </Badge>
                  {entry.bodyweightKg && (
                    <span className="text-xs font-mono text-neutral-500">
                      BW: {entry.bodyweightKg} kg
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Muscle groups */}
              {entry.muscleGroups && entry.muscleGroups.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.muscleGroups.map((group) => (
                    <span
                      key={group}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#2A2A2A]"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}

              {/* Working sets table */}
              {entry.exercises && entry.exercises.length > 0 && (
                <div className="border border-neutral-200 dark:border-[#242424] rounded overflow-hidden">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-neutral-50 dark:bg-[#181818] text-[10px] uppercase text-neutral-500 border-b border-neutral-200 dark:border-[#242424]">
                      <tr>
                        <th className="py-1.5 px-3">Exercise</th>
                        <th className="py-1.5 px-3">Sets</th>
                        <th className="py-1.5 px-3">Reps</th>
                        <th className="py-1.5 px-3 text-right">Load</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-[#1C1C1C]">
                      {entry.exercises.map((ex) => (
                        <tr key={ex.id}>
                          <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                            {ex.name}
                          </td>
                          <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                            {ex.sets}
                          </td>
                          <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                            {ex.reps}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-neutral-900 dark:text-neutral-200">
                            {ex.weightKg ? `${ex.weightKg} kg` : 'Bodyweight'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cardio & Personal Records */}
              {(entry.cardio || (entry.personalRecords && entry.personalRecords.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {entry.cardio && (
                    <div className="p-3 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                      <div className="text-[10px] uppercase text-neutral-500 mb-1 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Cardio Breakdown
                      </div>
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {entry.cardio.type}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {entry.cardio.durationMinutes} mins
                        {entry.cardio.distanceKm ? ` &bull; ${entry.cardio.distanceKm} km` : ''}
                        {entry.cardio.heartRateAvg ? ` &bull; ${entry.cardio.heartRateAvg} bpm avg` : ''}
                      </div>
                    </div>
                  )}

                  {entry.personalRecords && entry.personalRecords.length > 0 && (
                    <div className="p-3 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                      <div className="text-[10px] uppercase text-neutral-500 mb-1 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Personal Records Achieved
                      </div>
                      <ul className="space-y-0.5">
                        {entry.personalRecords.map((pr, idx) => (
                          <li key={idx} className="font-semibold text-neutral-900 dark:text-white">
                            &bull; {pr}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 italic bg-neutral-50/50 dark:bg-[#161616]/50 p-2.5 rounded border border-neutral-100 dark:border-[#1C1C1C]">
                  &ldquo;{entry.notes}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No physical training or workout session logged for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Add Workout Session
          </Button>
        </div>
      )}
    </section>
  );
};
