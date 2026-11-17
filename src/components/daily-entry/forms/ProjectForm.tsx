import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectEntry, EvidenceLink } from '../../../types';
import { PlanLinkSelector } from '../shared/PlanLinkSelector';
import { EntryFormActions } from '../shared/EntryFormActions';

interface ProjectFormProps {
  existingEntry?: ProjectEntry;
  dateKey: string;
  onSave: (entry: ProjectEntry) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [projectName, setProjectName] = useState(existingEntry?.projectName || '');
  const [objective, setObjective] = useState(existingEntry?.objective || '');
  const [tasks, setTasks] = useState(existingEntry?.tasksCompleted?.join('\n') || '');
  const [techImpl, setTechImpl] = useState(existingEntry?.technicalImplementation || '');
  const [decisions, setDecisions] = useState(existingEntry?.decisions || '');
  const [blockers, setBlockers] = useState(existingEntry?.blockers || '');
  const [progressPercent, setProgressPercent] = useState(
    existingEntry?.progressPercentage !== undefined
      ? String(existingEntry.progressPercentage)
      : '50'
  );
  const [nextSteps, setNextSteps] = useState(existingEntry?.nextSteps || '');
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Repo / Evidence Links
  const [repoLinks, setRepoLinks] = useState<EvidenceLink[]>(
    existingEntry?.repositoryLinks || []
  );
  const [repoLabel, setRepoLabel] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  // Plan Link
  const [planId, setPlanId] = useState<string | undefined>(existingEntry?.planId);
  const [planContribution, setPlanContribution] = useState<number | undefined>(
    existingEntry?.planContribution
  );

  const handleAddRepo = () => {
    if (repoLabel.trim() && repoUrl.trim()) {
      setRepoLinks([
        ...repoLinks,
        { id: `repo-${Date.now()}`, label: repoLabel.trim(), url: repoUrl.trim() },
      ]);
      setRepoLabel('');
      setRepoUrl('');
    }
  };

  const handleRemoveRepo = (id: string) => {
    setRepoLinks(repoLinks.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tasksList = tasks
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entry: ProjectEntry = {
      id: existingEntry?.id || `proj-${Date.now()}`,
      date: dateKey,
      projectName: projectName.trim() || 'Core Project',
      objective: objective.trim() || 'Focused build execution',
      tasksCompleted: tasksList.length > 0 ? tasksList : ['Progressive milestone execution'],
      technicalImplementation: techImpl.trim() || undefined,
      decisions: decisions.trim() || undefined,
      blockers: blockers.trim() || undefined,
      progressPercentage: parseInt(progressPercent, 10) || 50,
      nextSteps: nextSteps.trim() || undefined,
      repositoryLinks: repoLinks,
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
        category="project"
        planId={planId}
        contribution={planContribution}
        onChange={(pId, contrib) => {
          setPlanId(pId);
          setPlanContribution(contrib);
        }}
      />

      {/* Project Name & Estimated Stage Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Yester — Living Chronicle"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Current Phase Progress ({progressPercent}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={(e) => setProgressPercent(e.target.value)}
            className="w-full accent-[#FF7138] mt-2 cursor-pointer"
          />
        </div>
      </div>

      {/* Objective */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Objective / Milestone Vision
        </label>
        <input
          type="text"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="A sovereign personal operating system and calendar-first living record..."
          className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
        />
      </div>

      {/* Tasks Completed */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Tasks Completed Today (one per line)
        </label>
        <textarea
          rows={3}
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          placeholder="Engineered full-screen year selector physics..."
          className="w-full p-3 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
        />
      </div>

      {/* Architecture & Decisions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Technical Implementation Stack
          </label>
          <input
            type="text"
            value={techImpl}
            onChange={(e) => setTechImpl(e.target.value)}
            placeholder="React + TypeScript + Tailwind CSS"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Key Architecture Decisions
          </label>
          <input
            type="text"
            value={decisions}
            onChange={(e) => setDecisions(e.target.value)}
            placeholder="Enforced absolute monochrome Swiss aesthetic"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Repositories / Evidence */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase text-neutral-400 block">
          Repositories & Deployments
        </label>
        {repoLinks.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {repoLinks.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2 rounded bg-[#14181F] light:bg-[#F8F7F4] border border-[#242A35] light:border-[#E5E3DC] text-xs font-mono light:text-[#191B20]"
              >
                <div className="truncate">
                  <span className="text-[#FF7138]">{r.label}:</span>{' '}
                  <span className="text-neutral-400 light:text-[#626872]">{r.url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRepo(r.id)}
                  className="p-1 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={repoLabel}
            onChange={(e) => setRepoLabel(e.target.value)}
            placeholder="GitHub Repo"
            className="w-1/3 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <button
            type="button"
            onClick={handleAddRepo}
            className="p-1.5 rounded-lg bg-[#1E232B] light:bg-[#EBE9E3] hover:bg-[#2A313C] light:hover:bg-[#D7D5CE] text-neutral-300 light:text-[#191B20]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Next Steps, Blockers & Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Next Milestone Steps
          </label>
          <input
            type="text"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="Deploy canary build..."
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Blockers Identified
          </label>
          <input
            type="text"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="Awaiting peer review..."
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Project Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Design references..."
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};
