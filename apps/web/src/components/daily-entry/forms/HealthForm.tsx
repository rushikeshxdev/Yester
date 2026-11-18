import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { HealthEntry, DailyHabit, CustomMetric } from '../../../types';
import { EntryFormActions } from '../shared/EntryFormActions';

interface HealthFormProps {
  existingEntry?: HealthEntry;
  dateKey: string;
  onSave: (entry: HealthEntry) => void;
  onCancel: () => void;
}

export const HealthForm: React.FC<HealthFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [sleepHours, setSleepHours] = useState(
    existingEntry?.sleepHours !== undefined ? String(existingEntry.sleepHours) : '7.5'
  );
  const [sleepQuality, setSleepQuality] = useState<HealthEntry['sleepQuality']>(
    existingEntry?.sleepQuality || 'restful'
  );
  const [waterIntake, setWaterIntake] = useState(
    existingEntry?.waterIntakeLiters !== undefined
      ? String(existingEntry.waterIntakeLiters)
      : '3.0'
  );
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Habits
  const [habits, setHabits] = useState<DailyHabit[]>(
    existingEntry?.habits || [
      { id: 'h-1', name: 'No screens 60m before sleep', completed: false },
      { id: 'h-2', name: 'Cold shower / morning exposure', completed: false },
      { id: 'h-3', name: 'Daily journal reflection', completed: false },
      { id: 'h-4', name: 'Read minimum 30 minutes', completed: false },
    ]
  );
  const [newHabitName, setNewHabitName] = useState('');

  // Custom metrics
  const [customMetrics, setCustomMetrics] = useState<CustomMetric[]>(
    existingEntry?.customMetrics || []
  );
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [metricUnit, setMetricUnit] = useState('');

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      setHabits([
        ...habits,
        { id: `h-${Date.now()}`, name: newHabitName.trim(), completed: false },
      ]);
      setNewHabitName('');
    }
  };

  const handleToggleHabit = (id: string) => {
    setHabits(
      habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const handleRemoveHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const handleAddMetric = () => {
    if (metricName.trim() && metricValue.trim()) {
      setCustomMetrics([
        ...customMetrics,
        {
          id: `cm-${Date.now()}`,
          name: metricName.trim(),
          value: isNaN(Number(metricValue)) ? metricValue : Number(metricValue),
          unit: metricUnit.trim() || undefined,
        },
      ]);
      setMetricName('');
      setMetricValue('');
      setMetricUnit('');
    }
  };

  const handleRemoveMetric = (id: string) => {
    setCustomMetrics(customMetrics.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const entry: HealthEntry = {
      id: existingEntry?.id || `health-${Date.now()}`,
      date: dateKey,
      sleepHours: parseFloat(sleepHours) || 7.5,
      sleepQuality,
      waterIntakeLiters: parseFloat(waterIntake) || 2.5,
      habits,
      customMetrics: customMetrics.length > 0 ? customMetrics : undefined,
      notes: notes.trim() || undefined,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };

    onSave(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Vitals: Sleep, Quality, Hydration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Sleep Duration (Hours)
          </label>
          <input
            type="number"
            step="0.1"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Sleep Quality
          </label>
          <select
            value={sleepQuality}
            onChange={(e) => setSleepQuality(e.target.value as HealthEntry['sleepQuality'])}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          >
            <option value="restful">Restful / Deep</option>
            <option value="average">Average / Adequate</option>
            <option value="disrupted">Disrupted / Fragmented</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Water Intake (Liters)
          </label>
          <input
            type="number"
            step="0.1"
            value={waterIntake}
            onChange={(e) => setWaterIntake(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Habits Checklist */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase text-neutral-400 block">
          Daily Sovereign Habits
        </label>
        <div className="space-y-1.5 mb-2">
          {habits.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between p-2 rounded bg-[#14181F] light:bg-[#F8F7F4] border border-[#242A35] light:border-[#E5E3DC] text-xs font-mono light:text-[#191B20]"
            >
              <button
                type="button"
                onClick={() => handleToggleHabit(h.id)}
                className="flex items-center gap-2 text-left"
              >
                <span
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                    h.completed
                      ? 'bg-[#FF7138] border-[#FF7138] text-white'
                      : 'border-neutral-500 bg-transparent'
                  }`}
                >
                  {h.completed ? '✓' : ''}
                </span>
                <span className={h.completed ? 'line-through text-neutral-500' : 'text-neutral-300 light:text-[#191B20]'}>
                  {h.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveHabit(h.id)}
                className="p-1 text-neutral-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="New habit (e.g. 10m Meditation)"
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <button
            type="button"
            onClick={handleAddHabit}
            className="p-1.5 rounded-lg bg-[#1E232B] light:bg-[#EBE9E3] hover:bg-[#2A313C] light:hover:bg-[#D7D5CE] text-neutral-300 light:text-[#191B20]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Biometrics */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase text-neutral-400 block">
          Custom Biomarkers (RHR, HRV, Fasting)
        </label>
        {customMetrics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {customMetrics.map((cm) => (
              <div
                key={cm.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#14181F] light:bg-[#F8F7F4] border border-[#242A35] light:border-[#E5E3DC] text-xs font-mono text-neutral-300 light:text-[#191B20]"
              >
                <span>{cm.name}:</span>
                <span className="font-bold text-white light:text-[#191B20]">
                  {cm.value} {cm.unit || ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMetric(cm.id)}
                  className="text-neutral-500 hover:text-red-400 ml-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-12 gap-2">
          <input
            type="text"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            placeholder="Metric name (e.g. RHR)"
            className="col-span-5 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <input
            type="text"
            value={metricValue}
            onChange={(e) => setMetricValue(e.target.value)}
            placeholder="Value (e.g. 52)"
            className="col-span-4 px-2 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138] text-center"
          />
          <input
            type="text"
            value={metricUnit}
            onChange={(e) => setMetricUnit(e.target.value)}
            placeholder="Unit (bpm)"
            className="col-span-2 px-2 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138] text-center"
          />
          <button
            type="button"
            onClick={handleAddMetric}
            className="col-span-1 flex items-center justify-center rounded-lg bg-[#1E232B] light:bg-[#EBE9E3] hover:bg-[#2A313C] light:hover:bg-[#D7D5CE] text-neutral-300 light:text-[#191B20]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Health Notes / Subjective Feeling
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="High cognitive energy all morning..."
          className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
        />
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};

