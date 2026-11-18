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
      <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#141414] dark:bg-[#141414] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white dark:text-white light:text-neutral-900">
              Daily Reflection & Horizons
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">
              Evening retrospective, lessons distilled & tomorrow&apos;s primary targets
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={onEdit}
          icon={hasContent ? <Edit2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        >
          {hasContent ? 'Edit Reflection' : 'Write Reflection'}
        </Button>
      </div>

      {hasContent ? (
        <div className="p-5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white space-y-4 shadow-sm text-xs font-mono">
          {/* Dual column: What went well vs What went wrong */}
          {(reflection?.wentWell || reflection?.wentWrong) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reflection?.wentWell && (
                <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1.5">
                    <ThumbsUp className="w-3 h-3 text-neutral-400" />
                    What Went Well & Flow States
                  </div>
                  <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-serif italic text-sm leading-relaxed">
                    {reflection.wentWell}
                  </p>
                </div>
              )}

              {reflection?.wentWrong && (
                <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1.5">
                    <ThumbsDown className="w-3 h-3 text-neutral-400" />
                    Friction & Bottlenecks
                  </div>
                  <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-serif italic text-sm leading-relaxed">
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
                <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3 text-neutral-400" />
                    Principles & Knowledge Distilled
                  </div>
                  <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-serif italic text-sm leading-relaxed">
                    {reflection.learned}
                  </p>
                </div>
              )}

              {reflection?.shouldImprove && (
                <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-neutral-400" />
                    Habits & Behaviors to Calibrate
                  </div>
                  <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-serif italic text-sm leading-relaxed">
                    {reflection.shouldImprove}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Priorities for tomorrow */}
          {reflection?.prioritiesTomorrow && reflection.prioritiesTomorrow.length > 0 && (
            <div className="p-3.5 rounded bg-[#0F0F0F] dark:bg-[#0F0F0F] light:bg-neutral-50 border border-[#1C1C1C] dark:border-[#1C1C1C] light:border-neutral-200">
              <div className="text-[10px] uppercase font-bold text-neutral-400 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-neutral-400" />
                Tomorrow&apos;s Sovereign Targets
              </div>
              <ul className="space-y-1.5 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                {reflection.prioritiesTomorrow.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="font-bold text-neutral-500 font-mono">[{idx + 1}]</span>
                    <span className="font-medium text-white dark:text-white light:text-neutral-900">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Freeform Journal Notes */}
          {reflection?.freeformNotes && (
            <div className="p-4 rounded bg-[#0D0D0D] dark:bg-[#0D0D0D] light:bg-neutral-50 border border-[#1A1A1A] dark:border-[#1A1A1A] light:border-neutral-200">
              <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1.5 font-semibold">
                Free-form Journal Reflections
              </span>
              <p className="text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-serif italic text-sm leading-relaxed whitespace-pre-wrap">
                {reflection.freeformNotes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-dashed border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 text-center">
          <p className="text-xs font-mono text-neutral-500">
            No evening reflection or tomorrow targets recorded for this day.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            icon={<Plus className="w-3 h-3" />}
            className="mt-2 text-xs font-mono"
          >
            Conduct Evening Reflection
          </Button>
        </div>
      )}
    </section>
  );
};
