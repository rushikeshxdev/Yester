import React from 'react';
import { Sparkles, Plus, Edit2, ThumbsUp, ThumbsDown, Lightbulb, Wrench, ArrowRight } from 'lucide-react';
import { DailyReflection } from '../../types';
import { Button } from '../common/Button';

interface ReflectionSectionProps {
  reflection?: DailyReflection;
  onEdit: () => void;
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({
  reflection,
  onEdit,
}) => {
  const hasContent =
    reflection?.wentWell ||
    reflection?.wentWrong ||
    reflection?.learned ||
    reflection?.shouldImprove ||
    (reflection?.prioritiesTomorrow && reflection.prioritiesTomorrow.length > 0) ||
    reflection?.freeformNotes;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-neutral-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Daily Reflection & Priorities
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Evening retrospective, lessons distilled, tomorrow&apos;s primary targets
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={onEdit}
          icon={hasContent ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        >
          {hasContent ? 'Edit Reflection' : 'Write Reflection'}
        </Button>
      </div>

      {hasContent ? (
        <div className="p-5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#131313] space-y-4 shadow-sm text-xs font-mono">
          {/* Dual column: What went well vs What went wrong */}
          {(reflection?.wentWell || reflection?.wentWrong) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reflection?.wentWell && (
                <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                  <div className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-neutral-500" />
                    What Went Well
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {reflection.wentWell}
                  </p>
                </div>
              )}

              {reflection?.wentWrong && (
                <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                  <div className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
                    <ThumbsDown className="w-3.5 h-3.5 text-neutral-500" />
                    What Went Wrong / Friction
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {reflection.wentWrong}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Lessons Learned & Things to Improve */}
          {(reflection?.learned || reflection?.shouldImprove) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reflection?.learned && (
                <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                  <div className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-neutral-500" />
                    What Did I Learn?
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {reflection.learned}
                  </p>
                </div>
              )}

              {reflection?.shouldImprove && (
                <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
                  <div className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-neutral-500" />
                    What Should I Improve?
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {reflection.shouldImprove}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Priorities for tomorrow */}
          {reflection?.prioritiesTomorrow && reflection.prioritiesTomorrow.length > 0 && (
            <div className="p-3.5 rounded bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
              <div className="text-[10px] uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                Tomorrow&apos;s High-Priority Targets
              </div>
              <ul className="space-y-1 text-neutral-800 dark:text-neutral-200">
                {reflection.prioritiesTomorrow.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="font-bold text-neutral-400">[{idx + 1}]</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Freeform Journal Notes */}
          {reflection?.freeformNotes && (
            <div className="p-4 rounded bg-neutral-50/50 dark:bg-[#161616]/50 border border-neutral-200 dark:border-[#202020]">
              <span className="text-[10px] uppercase text-neutral-500 block mb-1 font-semibold">
                Free-form Journal Reflections
              </span>
              <p className="text-neutral-700 dark:text-neutral-300 italic leading-relaxed whitespace-pre-wrap">
                {reflection.freeformNotes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-neutral-200 dark:border-[#242424] text-center">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
            No reflection or priorities recorded for this date.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="mt-2 text-xs font-mono"
          >
            Conduct Evening Reflection
          </Button>
        </div>
      )}
    </section>
  );
};
