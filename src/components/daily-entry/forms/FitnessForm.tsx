import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FitnessEntry, ExerciseSet } from '../../../types';
import { PlanLinkSelector } from '../shared/PlanLinkSelector';
import { EntryFormActions } from '../shared/EntryFormActions';

interface FitnessFormProps {
  existingEntry?: FitnessEntry;
  dateKey: string;
  onSave: (entry: FitnessEntry) => void;
  onCancel: () => void;
}

export const FitnessForm: React.FC<FitnessFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [workoutType, setWorkoutType] = useState<FitnessEntry['workoutType']>(
    existingEntry?.workoutType || 'Strength'
  );
  const [duration, setDuration] = useState(
    existingEntry?.workoutDurationMinutes ? String(existingEntry.workoutDurationMinutes) : '60'
  );
  const [bodyweight, setBodyweight] = useState(
    existingEntry?.bodyweightKg ? String(existingEntry.bodyweightKg) : ''
  );
  const [muscleGroups, setMuscleGroups] = useState(
    existingEntry?.muscleGroups?.join(', ') || ''
  );
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Exercises
  const [exercises, setExercises] = useState<ExerciseSet[]>(
    existingEntry?.exercises || []
  );
  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10');
  const [exWeight, setExWeight] = useState('');

  // Cardio detail
  const [cardioType, setCardioType] = useState(existingEntry?.cardio?.type || '');
  const [cardioDuration, setCardioDuration] = useState(
    existingEntry?.cardio?.durationMinutes ? String(existingEntry.cardio.durationMinutes) : ''
  );
  const [cardioDistance, setCardioDistance] = useState(
    existingEntry?.cardio?.distanceKm ? String(existingEntry.cardio.distanceKm) : ''
  );
  const [cardioHR, setCardioHR] = useState(
    existingEntry?.cardio?.heartRateAvg ? String(existingEntry.cardio.heartRateAvg) : ''
  );

  // Plan Link
  const [planId, setPlanId] = useState<string | undefined>(existingEntry?.planId);
  const [planContribution, setPlanContribution] = useState<number | undefined>(
    existingEntry?.planContribution
  );

  const handleAddExercise = () => {
    if (exName.trim()) {
      setExercises([
        ...exercises,
        {
          id: `ex-${Date.now()}`,
          name: exName.trim(),
          sets: parseInt(exSets, 10) || 3,
          reps: parseInt(exReps, 10) || 10,
          weightKg: exWeight ? parseFloat(exWeight) : undefined,
        },
      ]);
      setExName('');
      setExWeight('');
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const musclesList = muscleGroups
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entry: FitnessEntry = {
      id: existingEntry?.id || `fit-${Date.now()}`,
      date: dateKey,
      workoutType,
      muscleGroups: musclesList,
      workoutDurationMinutes: parseInt(duration, 10) || 45,
      bodyweightKg: bodyweight ? parseFloat(bodyweight) : undefined,
      exercises,
      cardio: cardioType.trim()
        ? {
            type: cardioType.trim(),
            durationMinutes: parseInt(cardioDuration, 10) || 30,
            distanceKm: cardioDistance ? parseFloat(cardioDistance) : undefined,
            heartRateAvg: cardioHR ? parseInt(cardioHR, 10) : undefined,
          }
        : undefined,
      notes: notes.trim() || undefined,
      planId: planId || undefined,
      planContribution: planId ? (planContribution ?? 1) : undefined,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };

    onSave(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Plan Link Selector */}
      <PlanLinkSelector
        category="fitness"
        planId={planId}
        contribution={planContribution}
        onChange={(pId, contrib) => {
          setPlanId(pId);
          setPlanContribution(contrib);
        }}
      />

      {/* Workout Type & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Modality / Type *
          </label>
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value as FitnessEntry['workoutType'])}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          >
            <option value="Strength">Strength / Hypertrophy</option>
            <option value="Cardio">Cardio / Zone 2 Endurance</option>
            <option value="HIIT">HIIT / Conditioning</option>
            <option value="Mobility">Mobility / Yoga</option>
            <option value="Sports">Sports / Athletics</option>
            <option value="Recovery">Active Recovery</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Duration (Minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Morning Bodyweight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            placeholder="81.5"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Target Muscle Groups */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Muscle Groups / Focus (comma separated)
        </label>
        <input
          type="text"
          value={muscleGroups}
          onChange={(e) => setMuscleGroups(e.target.value)}
          placeholder="Chest, Shoulders, Triceps"
          className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
        />
      </div>

      {/* Exercise Sets Builder */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase text-neutral-400 block">
          Exercises & Sets
        </label>
        {exercises.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-2 rounded bg-[#14181F] light:bg-[#F8F7F4] border border-[#242A35] light:border-[#E5E3DC] text-xs font-mono light:text-[#191B20]"
              >
                <div>
                  <span className="font-semibold text-white light:text-[#191B20]">{ex.name}</span>
                  <span className="text-neutral-400 light:text-[#626872] ml-2">
                    {ex.sets} sets &times; {ex.reps} reps {ex.weightKg ? `@ ${ex.weightKg}kg` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(ex.id)}
                  className="p-1 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={exName}
            onChange={(e) => setExName(e.target.value)}
            placeholder="Exercise name (e.g. Barbell Bench)"
            className="col-span-5 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <input
            type="number"
            value={exSets}
            onChange={(e) => setExSets(e.target.value)}
            placeholder="Sets"
            className="col-span-2 px-2 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138] text-center"
          />
          <input
            type="number"
            value={exReps}
            onChange={(e) => setExReps(e.target.value)}
            placeholder="Reps"
            className="col-span-2 px-2 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138] text-center"
          />
          <input
            type="number"
            step="0.5"
            value={exWeight}
            onChange={(e) => setExWeight(e.target.value)}
            placeholder="kg"
            className="col-span-2 px-2 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138] text-center"
          />
          <button
            type="button"
            onClick={handleAddExercise}
            className="col-span-1 flex items-center justify-center rounded-lg bg-[#1E232B] light:bg-[#EBE9E3] hover:bg-[#2A313C] light:hover:bg-[#D7D5CE] text-neutral-300 light:text-[#191B20]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cardio specifics */}
      <div className="p-3 rounded-xl bg-[#12151B] light:bg-[#F8F7F4] border border-[#1E232B] light:border-[#E5E3DC] space-y-2">
        <span className="text-[10px] font-mono uppercase text-neutral-400 light:text-[#626872] block font-semibold">
          Cardio / Aerobic Telemetry (Optional)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            value={cardioType}
            onChange={(e) => setCardioType(e.target.value)}
            placeholder="e.g. Trail Run, Echo Bike"
            className="px-2.5 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20]"
          />
          <input
            type="number"
            value={cardioDuration}
            onChange={(e) => setCardioDuration(e.target.value)}
            placeholder="Duration (m)"
            className="px-2.5 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20]"
          />
          <input
            type="number"
            step="0.1"
            value={cardioDistance}
            onChange={(e) => setCardioDistance(e.target.value)}
            placeholder="Distance (km)"
            className="px-2.5 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20]"
          />
          <input
            type="number"
            value={cardioHR}
            onChange={(e) => setCardioHR(e.target.value)}
            placeholder="Avg HR (bpm)"
            className="px-2.5 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20]"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Session Impressions / Biofeedback
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explosive concentric phase on bench felt effortless today..."
          className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
        />
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};

