import React, { useState } from 'react';
import { LearningEntry } from '../../../types';
import { PlanLinkSelector } from '../shared/PlanLinkSelector';
import { EntryFormActions } from '../shared/EntryFormActions';

interface LearningFormProps {
  existingEntry?: LearningEntry;
  dateKey: string;
  onSave: (entry: LearningEntry) => void;
  onCancel: () => void;
}

export const LearningForm: React.FC<LearningFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [subject, setSubject] = useState(existingEntry?.subject || '');
  const [techConcept, setTechConcept] = useState(
    existingEntry?.technologyOrConcept || ''
  );
  const [source, setSource] = useState(existingEntry?.learningSource || '');
  const [duration, setDuration] = useState(
    existingEntry?.studyDurationMinutes ? String(existingEntry.studyDurationMinutes) : '45'
  );
  const [whatIUnderstood, setWhatIUnderstood] = useState(
    existingEntry?.whatIUnderstood || ''
  );
  const [whatToImprove, setWhatToImprove] = useState(
    existingEntry?.whatToImprove || ''
  );
  const [practicalImpl, setPracticalImpl] = useState(
    existingEntry?.practicalImplementation || ''
  );
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Plan Link
  const [planId, setPlanId] = useState<string | undefined>(existingEntry?.planId);
  const [planContribution, setPlanContribution] = useState<number | undefined>(
    existingEntry?.planContribution
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const entry: LearningEntry = {
      id: existingEntry?.id || `learn-${Date.now()}`,
      date: dateKey,
      subject: subject.trim() || 'General Study',
      technologyOrConcept: techConcept.trim() || 'Systems Thinking',
      learningSource: source.trim() || 'Direct Practice & Research',
      studyDurationMinutes: parseInt(duration, 10) || 45,
      whatIUnderstood: whatIUnderstood.trim() || undefined,
      whatToImprove: whatToImprove.trim() || undefined,
      practicalImplementation: practicalImpl.trim() || undefined,
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
        category="learning"
        planId={planId}
        contribution={planContribution}
        onChange={(pId, contrib) => {
          setPlanId(pId);
          setPlanContribution(contrib);
        }}
      />

      {/* Subject, Concept & Source */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Domain / Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Distributed Systems"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Technology / Concept *
          </label>
          <input
            type="text"
            required
            value={techConcept}
            onChange={(e) => setTechConcept(e.target.value)}
            placeholder="e.g. Raft Consensus Safety"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
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
      </div>

      {/* Learning Source */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Source Material / Reference (Book, Paper, RFC, Codebase)
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g. Ongaro & Ousterhout Stanford Dissertation, Chapter 4"
          className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
        />
      </div>

      {/* What I Understood & What To Improve */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            What I Understood (Core Insight)
          </label>
          <textarea
            rows={3}
            value={whatIUnderstood}
            onChange={(e) => setWhatIUnderstood(e.target.value)}
            placeholder="Single-server membership changes are strictly safer and simpler than full joint consensus..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Questions / What to Explore Next
          </label>
          <textarea
            rows={3}
            value={whatToImprove}
            onChange={(e) => setWhatToImprove(e.target.value)}
            placeholder="Need to simulate network partition test harness in Go to inspect election split-vote safety..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
      </div>

      {/* Practical Implementation & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Practical Application
          </label>
          <textarea
            rows={2}
            value={practicalImpl}
            onChange={(e) => setPracticalImpl(e.target.value)}
            placeholder="Sketched state machine transition diagram for joint configuration membership..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            General Notes / Context
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context or key references..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};
