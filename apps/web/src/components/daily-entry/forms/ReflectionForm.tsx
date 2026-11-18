import React, { useState } from 'react';
import { DailyReflection } from '../../../types';
import { EntryFormActions } from '../shared/EntryFormActions';

interface ReflectionFormProps {
  existingEntry?: DailyReflection;
  dateKey: string;
  onSave: (entry: DailyReflection) => void;
  onCancel: () => void;
}

export const ReflectionForm: React.FC<ReflectionFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [wentWell, setWentWell] = useState(existingEntry?.wentWell || '');
  const [wentWrong, setWentWrong] = useState(existingEntry?.wentWrong || '');
  const [learned, setLearned] = useState(existingEntry?.learned || '');
  const [shouldImprove, setShouldImprove] = useState(existingEntry?.shouldImprove || '');
  const [priorities, setPriorities] = useState(
    existingEntry?.prioritiesTomorrow?.join('\n') || ''
  );
  const [freeform, setFreeform] = useState(existingEntry?.freeformNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const prioritiesList = priorities
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entry: DailyReflection = {
      id: existingEntry?.id || `refl-${Date.now()}`,
      date: dateKey,
      wentWell: wentWell.trim() || undefined,
      wentWrong: wentWrong.trim() || undefined,
      learned: learned.trim() || undefined,
      shouldImprove: shouldImprove.trim() || undefined,
      prioritiesTomorrow: prioritiesList.length > 0 ? prioritiesList : undefined,
      freeformNotes: freeform.trim() || undefined,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };

    onSave(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            What Went Well
          </label>
          <textarea
            rows={3}
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            placeholder="Deep focus block with zero Slack distractions..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            What Went Wrong / Blockers
          </label>
          <textarea
            rows={3}
            value={wentWrong}
            onChange={(e) => setWentWrong(e.target.value)}
            placeholder="Delayed nutrition window which caused slight afternoon dip..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Key Insight / What I Learned
          </label>
          <textarea
            rows={3}
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="Simplifying assumptions in protocol design trumps complex state reconciliation..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            What to Calibrate / Improve
          </label>
          <textarea
            rows={3}
            value={shouldImprove}
            onChange={(e) => setShouldImprove(e.target.value)}
            placeholder="Enforce strict 1:00 PM nutrition window regardless of flow..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
      </div>

      {/* Tomorrow's Intent / Priorities */}
      <div>
        <label className="text-[11px] font-mono uppercase text-[#FF7138] block mb-1 font-semibold">
          Tomorrow's Top 3 Intentions (One per line — feeds into Tomorrow's Brief)
        </label>
        <textarea
          rows={3}
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          placeholder="Deploy canary build for epoch rebalancer&#10;Deadlift heavy volume session (5x3)&#10;Review Raft leader transfer protocol"
          className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#FF7138]/40 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
        />
      </div>

      {/* Freeform Notes */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Evening Philosophical Reflections / Freeform Stream
        </label>
        <textarea
          rows={3}
          value={freeform}
          onChange={(e) => setFreeform(e.target.value)}
          placeholder="Quiet discipline compounds imperceptibly every single day. The calendar reflects reality."
          className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
        />
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};

