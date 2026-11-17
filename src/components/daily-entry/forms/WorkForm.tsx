import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { WorkEntry, EvidenceLink } from '../../../types';
import { PlanLinkSelector } from '../shared/PlanLinkSelector';
import { EntryFormActions } from '../shared/EntryFormActions';

interface WorkFormProps {
  existingEntry?: WorkEntry;
  dateKey: string;
  onSave: (entry: WorkEntry) => void;
  onCancel: () => void;
}

export const WorkForm: React.FC<WorkFormProps> = ({
  existingEntry,
  dateKey,
  onSave,
  onCancel,
}) => {
  const [organization, setOrganization] = useState(existingEntry?.organization || '');
  const [project, setProject] = useState(existingEntry?.project || '');
  const [role, setRole] = useState(existingEntry?.role || '');
  const [tasks, setTasks] = useState(existingEntry?.tasksPerformed?.join('\n') || '');
  const [problems, setProblems] = useState(existingEntry?.problemsIdentified || '');
  const [rootCauses, setRootCauses] = useState(existingEntry?.rootCauses || '');
  const [approach, setApproach] = useState(existingEntry?.approachTaken || '');
  const [solution, setSolution] = useState(existingEntry?.solutionImplemented || '');
  const [techDecisions, setTechDecisions] = useState(existingEntry?.technicalDecisions || '');
  const [technologies, setTechnologies] = useState(existingEntry?.technologiesUsed?.join(', ') || '');
  const [outcome, setOutcome] = useState(existingEntry?.outcomeImpact || '');
  const [whatILearned, setWhatILearned] = useState(existingEntry?.whatILearned || '');
  const [reflections, setReflections] = useState(existingEntry?.reflections || '');
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  // Evidence links
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>(
    existingEntry?.evidenceLinks || []
  );
  const [evLabel, setEvLabel] = useState('');
  const [evUrl, setEvUrl] = useState('');

  // Plan Link
  const [planId, setPlanId] = useState<string | undefined>(existingEntry?.planId);
  const [planContribution, setPlanContribution] = useState<number | undefined>(
    existingEntry?.planContribution
  );

  const handleAddEvidence = () => {
    if (evLabel.trim() && evUrl.trim()) {
      setEvidenceLinks([
        ...evidenceLinks,
        { id: `ev-${Date.now()}`, label: evLabel.trim(), url: evUrl.trim() },
      ]);
      setEvLabel('');
      setEvUrl('');
    }
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceLinks(evidenceLinks.filter((ev) => ev.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tasksList = tasks
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    const techList = technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const entry: WorkEntry = {
      id: existingEntry?.id || `work-${Date.now()}`,
      date: dateKey,
      organization: organization.trim() || 'Independent Focus',
      project: project.trim() || 'Primary Initiative',
      role: role.trim() || undefined,
      tasksPerformed: tasksList.length > 0 ? tasksList : ['Focused engineering execution'],
      problemsIdentified: problems.trim() || undefined,
      rootCauses: rootCauses.trim() || undefined,
      approachTaken: approach.trim() || undefined,
      solutionImplemented: solution.trim() || undefined,
      technicalDecisions: techDecisions.trim() || undefined,
      technologiesUsed: techList,
      outcomeImpact: outcome.trim() || undefined,
      evidenceLinks,
      whatILearned: whatILearned.trim() || undefined,
      reflections: reflections.trim() || undefined,
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
        category="work"
        planId={planId}
        contribution={planContribution}
        onChange={(pId, contrib) => {
          setPlanId(pId);
          setPlanContribution(contrib);
        }}
      />

      {/* Primary Context: Organization, Project, Role */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Organization / Team
          </label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Core Infrastructure"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Project / Initiative *
          </label>
          <input
            type="text"
            required
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. Broker Engine v2"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Principal Architect"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Tasks Performed */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Tasks Performed (one per line)
        </label>
        <textarea
          rows={3}
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          placeholder="Profiled memory footprint in zero-copy socket buffer allocation..."
          className="w-full p-3 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
        />
      </div>

      {/* Technical Problem, Root Causes, Approach & Solution Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Problems Identified
          </label>
          <textarea
            rows={2}
            value={problems}
            onChange={(e) => setProblems(e.target.value)}
            placeholder="Rebalancing latency spikes during pod restarts..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Root Causes Analyzed
          </label>
          <textarea
            rows={2}
            value={rootCauses}
            onChange={(e) => setRootCauses(e.target.value)}
            placeholder="Eager partition assignment revoked all assignments simultaneously..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Approach Taken
          </label>
          <textarea
            rows={2}
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            placeholder="Transitioned to incremental cooperative rebalancing..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Solution Implemented
          </label>
          <textarea
            rows={2}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Deterministic two-phase hash ring partition assignment..."
            className="w-full p-2.5 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] resize-none"
          />
        </div>
      </div>

      {/* Technical Decisions */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
          Technical Decisions & Trade-offs
        </label>
        <input
          type="text"
          value={techDecisions}
          onChange={(e) => setTechDecisions(e.target.value)}
          placeholder="Chose embedded RingBuffer over channels to eliminate 35% GC overhead"
          className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
        />
      </div>

      {/* Outcome / Impact & Tech Stack */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Outcome / Quantified Impact
          </label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="P99 tail latency dropped from 480ms to 42ms"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Technologies Used (comma separated)
          </label>
          <input
            type="text"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="Rust, Tokio, eBPF, Kafka"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Learnings & Reflections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            What I Learned
          </label>
          <input
            type="text"
            value={whatILearned}
            onChange={(e) => setWhatILearned(e.target.value)}
            placeholder="Cooperative rebalancing requires strict epoch monotonicity"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
            Reflections & Notes
          </label>
          <input
            type="text"
            value={notes || reflections}
            onChange={(e) => {
              setNotes(e.target.value);
              setReflections(e.target.value);
            }}
            placeholder="Clean mathematical modeling upfront saved days of chaotic race conditions"
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
          />
        </div>
      </div>

      {/* Evidence Links */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase text-neutral-400 block">
          Evidence & Artifact Links (PRs, ADRs, Docs)
        </label>
        {evidenceLinks.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {evidenceLinks.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2 rounded bg-[#14181F] light:bg-[#F8F7F4] border border-[#242A35] light:border-[#E5E3DC] text-xs font-mono light:text-[#191B20]"
              >
                <div className="truncate">
                  <span className="text-[#FF7138]">{ev.label}:</span>{' '}
                  <span className="text-neutral-400 light:text-[#626872]">{ev.url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(ev.id)}
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
            value={evLabel}
            onChange={(e) => setEvLabel(e.target.value)}
            placeholder="PR #1429"
            className="w-1/3 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <input
            type="url"
            value={evUrl}
            onChange={(e) => setEvUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#14181F] light:bg-[#FFFFFF] border border-[#242A35] light:border-[#D7D5CE] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
          />
          <button
            type="button"
            onClick={handleAddEvidence}
            className="p-1.5 rounded-lg bg-[#1E232B] light:bg-[#EBE9E3] hover:bg-[#2A313C] light:hover:bg-[#D7D5CE] text-neutral-300 light:text-[#191B20]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <EntryFormActions onCancel={onCancel} isEdit={!!existingEntry} />
    </form>
  );
};
