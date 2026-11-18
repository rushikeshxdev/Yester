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
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
            <Dumbbell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white dark:text-white light:text-neutral-900">
              Physical & Fitness
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Strength training, endurance, sets, reps & body metrics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Session' : 'Sessions'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3 h-3" />}>
            Add Workout
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white hover:border-neutral-600 dark:hover:border-neutral-600 light:hover:border-neutral-400 transition-colors space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-serif font-normal text-white dark:text-white light:text-neutral-900">
                    {entry.workoutType} Session
                  </span>
                  <Badge variant="active" size="sm">
                    {entry.workoutDurationMinutes} mins
                  </Badge>
                  {entry.bodyweightKg && (
                    <span className="text-xs font-mono text-neutral-400">
                      BW: {entry.bodyweightKg} kg
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-500 hover:text-white dark:hover:text-white light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Muscle groups */}
              {entry.muscleGroups && entry.muscleGroups.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.muscleGroups.map((group) => (
                    <span
                      key={group}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 border border-[#222222] dark:border-[#222222] light:border-neutral-200"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}

              {/* Working sets table */}
              {entry.exercises && entry.exercises.length > 0 && (
                <div className="border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 rounded overflow-hidden">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-[#121212] dark:bg-[#121212] light:bg-neutral-50 text-[10px] uppercase text-neutral-500 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
                      <tr>
                        <th className="py-2 px-3">Movement</th>
                        <th className="py-2 px-3">Sets</th>
                        <th className="py-2 px-3">Reps</th>
                        <th className="py-2 px-3 text-right">Load</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#161616] dark:divide-[#161616] light:divide-neutral-100">
                      {entry.exercises.map((ex) => (
                        <tr key={ex.id}>
                          <td className="py-2 px-3 font-medium text-white dark:text-white light:text-neutral-900">
                            {ex.name}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {ex.sets}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {ex.reps}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-white dark:text-white light:text-neutral-900">
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
                    <div className="p-3 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                      <div className="text-[10px] uppercase text-neutral-400 mb-1 flex items-center gap-1 font-semibold">
                        <Timer className="w-3 h-3" />
                        Cardio Breakdown
                      </div>
                      <div className="font-medium text-white dark:text-white light:text-neutral-900">
                        {entry.cardio.type}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {entry.cardio.durationMinutes} mins
                        {entry.cardio.distanceKm ? ` &bull; ${entry.cardio.distanceKm} km` : ''}
                        {entry.cardio.heartRateAvg ? ` &bull; ${entry.cardio.heartRateAvg} bpm` : ''}
                      </div>
                    </div>
                  )}

                  {entry.personalRecords && entry.personalRecords.length > 0 && (
                    <div className="p-3 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                      <div className="text-[10px] uppercase text-neutral-400 mb-1 flex items-center gap-1 font-semibold">
                        <Award className="w-3 h-3" />
                        Personal Record
                      </div>
                      <ul className="space-y-0.5">
                        {entry.personalRecords.map((pr, idx) => (
                          <li key={idx} className="font-semibold text-white dark:text-white light:text-neutral-900">
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
                <div className="text-xs font-serif italic text-neutral-400 dark:text-neutral-400 light:text-neutral-600 bg-[#0E0E0E] dark:bg-[#0E0E0E] light:bg-neutral-50 p-3 rounded border border-[#181818] dark:border-[#181818] light:border-neutral-200">
                  &ldquo;{entry.notes}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 text-center">
          <p className="text-xs font-mono text-neutral-500">
            No physical training or workout session documented for this day.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3 h-3" />}
            className="mt-2 text-xs font-mono"
          >
            Add Workout Session
          </Button>
        </div>
      )}
    </section>
  );
};
