import React from 'react';
import { Briefcase, Plus, Edit2, Trash2, ExternalLink, Code2, AlertTriangle } from 'lucide-react';
import { WorkEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface WorkSectionProps {
  entries: WorkEntry[];
  onAdd: () => void;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entryId: string) => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  entries,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-neutral-200">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Work & Professional
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              High-impact engineering, systems architecture, problem solving
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Record' : 'Records'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Entry
          </Button>
        </div>
      </div>

      {/* Entries List */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#131313] hover:border-neutral-300 dark:hover:border-[#303030] transition-colors space-y-4 shadow-sm"
            >
              {/* Header: Org, Project, Role, and Actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">
                      {entry.organization}
                    </span>
                    <span className="text-neutral-400">&bull;</span>
                    <span className="text-sm font-mono text-neutral-600 dark:text-neutral-300 font-medium">
                      {entry.project}
                    </span>
                    {entry.role && (
                      <Badge variant="default" size="sm">
                        {entry.role}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                    title="Edit record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tasks Performed */}
              {entry.tasksPerformed && entry.tasksPerformed.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Execution
                  </span>
                  <ul className="space-y-1 text-xs font-mono text-neutral-700 dark:text-neutral-300">
                    {entry.tasksPerformed.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-neutral-400">&bull;</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Problems & Root Causes & Solution Grid */}
              {(entry.problemsIdentified || entry.solutionImplemented) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222] text-xs font-mono">
                  {entry.problemsIdentified && (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Problem & Root Cause
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {entry.problemsIdentified}
                      </p>
                      {entry.rootCauses && (
                        <p className="text-neutral-500 text-[11px] mt-1">
                          Cause: {entry.rootCauses}
                        </p>
                      )}
                    </div>
                  )}

                  {entry.solutionImplemented && (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-neutral-500 font-semibold mb-1 flex items-center gap-1">
                        <Code2 className="w-3 h-3" />
                        Solution & Approach
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {entry.solutionImplemented}
                      </p>
                      {entry.technicalDecisions && (
                        <p className="text-neutral-500 text-[11px] mt-1">
                          Decision: {entry.technicalDecisions}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Technologies & Outcome */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {entry.technologiesUsed && entry.technologiesUsed.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.technologiesUsed.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#2A2A2A]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {entry.outcomeImpact && (
                  <div className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
                    <span className="text-neutral-500 font-normal">Impact: </span>
                    {entry.outcomeImpact}
                  </div>
                )}
              </div>

              {/* Evidence Links */}
              {entry.evidenceLinks && entry.evidenceLinks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-neutral-100 dark:border-[#1E1E1E]">
                  <span className="text-[10px] font-mono uppercase text-neutral-500">Evidence:</span>
                  {entry.evidenceLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 hover:underline hover:text-black dark:hover:text-white"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}

              {/* Reflections & Learnings */}
              {(entry.whatILearned || entry.reflections) && (
                <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 italic bg-neutral-50/50 dark:bg-[#161616]/50 p-2.5 rounded border border-neutral-100 dark:border-[#1C1C1C]">
                  {entry.whatILearned && <div>&ldquo;{entry.whatILearned}&rdquo;</div>}
                  {entry.reflections && <div className="mt-1 font-normal not-italic text-neutral-500">{entry.reflections}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No work or professional activity logged for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Add Work Record
          </Button>
        </div>
      )}
    </section>
  );
};
