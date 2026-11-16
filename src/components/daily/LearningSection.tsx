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
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white dark:text-white light:text-neutral-900">
              Learning & Education
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Intellectual acquisition, deep reading, algorithms & mental models
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <Badge variant="outline" size="sm">
              {entries.length} {entries.length === 1 ? 'Session' : 'Sessions'}
            </Badge>
          )}
          <Button size="sm" variant="secondary" onClick={onAdd} icon={<Plus className="w-3 h-3" />}>
            Add Study Session
          </Button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white hover:border-neutral-600 dark:hover:border-neutral-600 light:hover:border-neutral-400 transition-colors space-y-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base font-serif font-normal text-white dark:text-white light:text-neutral-900">
                    {entry.subject}
                  </span>
                  <span className="text-neutral-600">&bull;</span>
                  <span className="text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-semibold">
                    {entry.technologyOrConcept}
                  </span>
                  <Badge variant="default" size="sm">
                    {entry.studyDurationMinutes} mins
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(entry)}
                    className="p-1.5 text-neutral-500 hover:text-white dark:hover:text-white light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Source */}
              {entry.learningSource && (
                <div className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                  <span className="uppercase text-[10px] text-neutral-500">Source:</span>
                  <span className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700">{entry.learningSource}</span>
                </div>
              )}

              {/* What I Understood & Need to Improve */}
              {(entry.whatIUnderstood || entry.whatToImprove) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {entry.whatIUnderstood && (
                    <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                      <div className="text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                        Core Mental Model Synthesized
                      </div>
                      <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                        {entry.whatIUnderstood}
                      </p>
                    </div>
                  )}

                  {entry.whatToImprove && (
                    <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                      <div className="text-[10px] uppercase font-semibold text-neutral-400 mb-1">
                        To Deepen & Clarify
                      </div>
                      <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
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
                  <ul className="space-y-1 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                    {entry.problemsSolved.map((p, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practical Implementation & Notes */}
              {(entry.practicalImplementation || entry.notes) && (
                <div className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600 bg-[#0E0E0E] dark:bg-[#0E0E0E] light:bg-neutral-50 p-3 rounded border border-[#181818] dark:border-[#181818] light:border-neutral-200 space-y-1">
                  {entry.practicalImplementation && (
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 block">Practical Lab:</span>
                      <span className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700">{entry.practicalImplementation}</span>
                    </div>
                  )}
                  {entry.notes && <div className="italic font-serif text-neutral-400 mt-1">&ldquo;{entry.notes}&rdquo;</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 text-center">
          <p className="text-xs font-mono text-neutral-500">
            No learning or intellectual acquisition documented for this day.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            icon={<Plus className="w-3 h-3" />}
            className="mt-2 text-xs font-mono"
          >
            Add Study Session
          </Button>
        </div>
      )}
    </section>
  );
};
