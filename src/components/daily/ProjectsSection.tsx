import React from 'react';
import { FolderKanban, Plus, Edit2, Trash2, ExternalLink, GitBranch } from 'lucide-react';
import { ProjectEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface ProjectsSectionProps {
  entries: ProjectEntry[];
  onAdd: () => void;
  onEdit: (entry: ProjectEntry) => void;
  onDelete: (entryId: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  entries,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-neutral-200">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Personal Projects
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Independent software creations, open source, products
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Project' : 'Projects'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Project
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#131313] hover:border-neutral-300 dark:hover:border-[#303030] transition-colors space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">
                    {entry.projectName}
                  </span>
                  {entry.progressPercentage !== undefined && (
                    <Badge variant="active" size="sm">
                      {entry.progressPercentage}% Complete
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-[#1F1F1F] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Objective */}
              <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                <span className="uppercase text-[10px] text-neutral-400 block mb-0.5">Objective:</span>
                <p>{entry.objective}</p>
              </div>

              {/* Progress bar */}
              {entry.progressPercentage !== undefined && (
                <div className="w-full bg-neutral-200 dark:bg-[#202020] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-900 dark:bg-white h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, entry.progressPercentage))}%` }}
                  />
                </div>
              )}

              {/* Tasks completed */}
              {entry.tasksCompleted && entry.tasksCompleted.length > 0 && (
                <div className="space-y-1 text-xs font-mono">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold">
                    Tasks Completed
                  </span>
                  <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                    {entry.tasksCompleted.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-neutral-400">&bull;</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decisions & Blockers */}
              {(entry.decisions || entry.blockers) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {entry.decisions && (
                    <div className="p-3 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                        Architectural Decisions
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">{entry.decisions}</p>
                    </div>
                  )}

                  {entry.blockers && (
                    <div className="p-3 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                        Roadblocks & Challenges
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">{entry.blockers}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Next Steps & Repo Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-[#1E1E1E] text-xs font-mono">
                {entry.nextSteps && (
                  <div className="text-neutral-600 dark:text-neutral-400">
                    <span className="text-neutral-400 font-medium">Next: </span>
                    {entry.nextSteps}
                  </div>
                )}

                {entry.repositoryLinks && entry.repositoryLinks.length > 0 && (
                  <div className="flex items-center gap-2">
                    {entry.repositoryLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 hover:underline"
                      >
                        <GitBranch className="w-3 h-3" />
                        <span>{link.label}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No personal project milestones recorded for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Add Project Update
          </Button>
        </div>
      )}
    </section>
  );
};
