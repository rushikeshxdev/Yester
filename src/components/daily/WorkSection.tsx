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
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white dark:text-white light:text-neutral-900">
              Work & Professional
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              High-impact engineering, architecture, root causes & solutions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Record' : 'Records'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3 h-3" />}>
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
              className="p-5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white hover:border-neutral-600 dark:hover:border-neutral-600 light:hover:border-neutral-400 transition-colors space-y-4 shadow-sm"
            >
              {/* Header: Org, Project, Role, and Actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-base font-serif font-normal text-white dark:text-white light:text-neutral-900">
                      {entry.organization}
                    </span>
                    <span className="text-neutral-600">&bull;</span>
                    <span className="text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-medium">
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
                    className="p-1.5 text-neutral-500 hover:text-white dark:hover:text-white light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                    title="Edit record"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tasks Performed */}
              {entry.tasksPerformed && entry.tasksPerformed.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Execution
                  </span>
                  <ul className="space-y-1 text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                    {entry.tasksPerformed.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-neutral-600">&bull;</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Problems & Root Causes & Solution Grid */}
              {(entry.problemsIdentified || entry.solutionImplemented) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200 text-xs font-mono">
                  {entry.problemsIdentified && (
                    <div>
                      <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-neutral-400" />
                        Problem & Root Cause
                      </div>
                      <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
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
                      <div className="text-[10px] uppercase font-mono text-neutral-400 font-semibold mb-1 flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-neutral-400" />
                        Solution & Approach
                      </div>
                      <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
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
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 border border-[#222222] dark:border-[#222222] light:border-neutral-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {entry.outcomeImpact && (
                  <div className="text-xs font-mono font-medium text-white dark:text-white light:text-neutral-900">
                    <span className="text-neutral-500 font-normal">Impact: </span>
                    {entry.outcomeImpact}
                  </div>
                )}
              </div>

              {/* Evidence Links */}
              {entry.evidenceLinks && entry.evidenceLinks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#181818] dark:border-[#181818] light:border-neutral-100">
                  <span className="text-[10px] font-mono uppercase text-neutral-500">Evidence:</span>
                  {entry.evidenceLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:underline"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}

              {/* Reflections & Learnings */}
              {(entry.whatILearned || entry.reflections) && (
                <div className="text-xs font-serif italic text-neutral-400 dark:text-neutral-400 light:text-neutral-600 bg-[#0E0E0E] dark:bg-[#0E0E0E] light:bg-neutral-50 p-3 rounded border border-[#181818] dark:border-[#181818] light:border-neutral-200">
                  {entry.whatILearned && <div>&ldquo;{entry.whatILearned}&rdquo;</div>}
                  {entry.reflections && <div className="mt-1 font-mono font-normal not-italic text-neutral-500 text-[11px]">{entry.reflections}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 text-center">
          <p className="text-xs font-mono text-neutral-500">
            No professional or architectural activity documented for this day.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3 h-3" />}
            className="mt-2 text-xs font-mono"
          >
            Add Work Entry
          </Button>
        </div>
      )}
    </section>
  );
};
