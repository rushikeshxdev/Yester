import React, { useState } from 'react';
import { PersonalEntry } from '../../../types';
import { PlanLinkSelector } from '../shared/PlanLinkSelector';
import { EntryFormActions } from '../shared/EntryFormActions';

interface PersonalFormProps {
  existingEntry?: PersonalEntry;
  dateKey: string;
  onSave: (entry: PersonalEntry) => void;
  onCancel: () => void;
}

export const PersonalForm: React.FC<PersonalFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(existingEntry?.title || '');
  const [type, setType] = useState<PersonalEntry['type']>(
    existingEntry?.type || 'experience'
  );
  const [people, setPeople] = useState(existingEntry?.peopleInvolved?.join(', ') || '');
  const [description, setDescription] = useState(existingEntry?.description || '');
  const [significance, setSignificance] = useState(existingEntry?.significance || '');
  const [location, setLocation] = useState(existingEntry?.location || '');
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Plan Link
  const [planId, setPlanId] = useState<string | undefined>(existingEntry?.planId);
  const [planContribution, setPlanContribution] = useState<number | undefined>(
    existingEntry?.planContribution
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const peopleList = people
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entry: PersonalEntry = {
      id: existingEntry?.id || `pers-${Date.now()}`,
      date: dateKey,
      title: title.trim() || 'Personal Moment',
      type,
      peopleInvolved: peopleList.length > 0 ? peopleList : undefined,
      description: description.trim() || 'Recorded life memory',
      significance: significance.trim() || undefined,
      location: location.trim() || undefined,
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
        category="personal"
        planId={planId}
        contribution={planContribution}
        onChange={(pId, contrib) => {
          setPlanId(pId);
          setPlanContribution(contrib);
        }}
      />

      {/* Title & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Memory Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Mindfulness & Espresso Routine"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Category Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PersonalEntry['type'])}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          >
            <option value="experience">Experience</option>
            <option value="family">Family</option>
            <option value="friends">Friends / Community</option>
            <option value="milestone">Life Milestone</option>
            <option value="memory">Cherished Memory</option>
            <option value="general">General Reflection</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Description of Moment *
        </label>
        <textarea
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="30 minutes of undisturbed early sunlight, aeropress single-origin Ethiopian coffee..."
          className="w-full p-3 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
        />
      </div>

      {/* People & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            People Involved (comma separated)
          </label>
          <input
            type="text"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder="e.g. Self, Maya, Alex"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Location / Environment
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Home Study Terrace"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Significance & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Why This Matters / Personal Significance
          </label>
          <input
            type="text"
            value={significance}
            onChange={(e) => setSignificance(e.target.value)}
            placeholder="Setting intentional tempo before opening any communication channels."
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Personal Notes & Context
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional reflections or memories..."
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};
