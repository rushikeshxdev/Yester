import React from 'react';
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { LearningEntry } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface LearningSectionProps {
  entries: LearningEntry[];
  onAdd: () => void;
  onEdit: (entry: LearningEntry) => void;
  onDelete: (entryId: string) => void;
}

export const LearningSection: React.FC<LearningSectionProps> = ({
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
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Learning & Education
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Intellectual acquisition, deep reading, algorithms, literature
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Session' : 'Sessions'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Study Session
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-mono font-bold text-neutral-900 dark:text-white">
                    {entry.subject}
                  </span>
                  <span className="text-neutral-400">&bull;</span>
                  <span className="text-sm font-mono text-neutral-700 dark:text-neutral-300 font-semibold">
                    {entry.technologyOrConcept}
                  </span>
                  <Badge variant="default" size="sm">
                    {entry.studyDurationMinutes} mins
                  </Badge>
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

              {/* Source */}
              {entry.learningSource && (
                <div className="text-xs font-mono text-neutral-500 flex items-center gap-1.5">
                  <span className="uppercase text-[10px] text-neutral-400">Source:</span>
                  <span className="text-neutral-700 dark:text-neutral-300">{entry.learningSource}</span>
                </div>
              )}

              {/* What I Understood & Need to Improve */}
              {(entry.whatIUnderstood || entry.whatToImprove) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {entry.whatIUnderstood && (
                    <div className="p-3 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                        What I Understood
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {entry.whatIUnderstood}
                      </p>
                    </div>
                  )}

                  {entry.whatToImprove && (
                    <div className="p-3 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                      <div className="text-[10px] uppercase font-semibold text-neutral-500 mb-1">
                        To Improve & Clarify
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200">
                        {entry.whatToImprove}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Problems solved */}
              {entry.problemsSolved && entry.problemsSolved.length > 0 && (
                <div className="space-y-1 text-xs font-mono">
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold">
                    Problems Solved
                  </span>
                  <ul className="space-y-1 text-neutral-700 dark:text-neutral-300">
                    {entry.problemsSolved.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practical Implementation & Notes */}
              {(entry.practicalImplementation || entry.notes) && (
                <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-50/50 dark:bg-[#161616]/50 p-2.5 rounded border border-neutral-100 dark:border-[#1C1C1C] space-y-1">
                  {entry.practicalImplementation && (
                    <div>
                      <span className="text-[10px] uppercase text-neutral-400 block">Implementation:</span>
                      <span>{entry.practicalImplementation}</span>
                    </div>
                  )}
                  {entry.notes && <div className="italic text-neutral-500 mt-1">&ldquo;{entry.notes}&rdquo;</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No learning or intellectual acquisition recorded for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Add Learning Session
          </Button>
        </div>
      )}
    </section>
  );
};
