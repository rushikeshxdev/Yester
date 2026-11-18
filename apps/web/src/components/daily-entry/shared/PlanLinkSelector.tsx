import React from 'react';
import { Target, Compass } from 'lucide-react';
import { useLifeOS } from '../../../context/LifeOSContext';
import { PlanCategory } from '../../../types';

interface PlanLinkSelectorProps {
  category: PlanCategory;
  planId?: string;
  contribution?: number;
  onChange: (planId: string | undefined, contribution: number | undefined) => void;
  className?: string;
}

export const PlanLinkSelector: React.FC<PlanLinkSelectorProps> = ({
  category,
  planId,
  contribution,
  onChange,
  className = '',
}) => {
  const { plans, navigateToPlans } = useLifeOS();

  // Filter active plans matching this category
  const matchingPlans = Object.values(plans).filter(
    (p) => p.status === 'active' && p.category === category
  );

  const selectedPlan = planId ? plans[planId] : undefined;

  if (matchingPlans.length === 0) {
    return (
      <div className={`p-3 rounded-xl border border-dashed border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 bg-[#0E1115]/50 dark:bg-[#0E1115]/50 light:bg-neutral-50 flex items-center justify-between text-xs font-mono text-neutral-400 ${className}`}>
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-[11px]">No active {category} plans set.</span>
        </div>
        <button
          type="button"
          onClick={navigateToPlans}
          className="text-[10px] uppercase font-bold text-[#FF7138] hover:underline flex items-center gap-1"
        >
          <Compass className="w-3 h-3" />
          <span>Set Plan</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 bg-[#0E1115] dark:bg-[#0E1115] light:bg-neutral-50 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-[#FF7138]" />
          <span>Contribute to Life Plan (Intent vs. Reality)</span>
        </label>
        {selectedPlan && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181D25] dark:bg-[#181D25] light:bg-neutral-200 text-[#FF7138] border border-[#242A35] dark:border-[#242A35] light:border-neutral-300">
            Target: {selectedPlan.targetValue} {selectedPlan.unitLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Plan Dropdown */}
        <div className="sm:col-span-2">
          <select
            value={planId || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                onChange(undefined, undefined);
              } else {
                onChange(val, contribution ?? 1);
              }
            }}
            className="w-full px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] transition-colors"
          >
            <option value="">Standalone Entry (No Plan Link)</option>
            {matchingPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.unitLabel})
              </option>
            ))}
          </select>
        </div>

        {/* Contribution Amount */}
        {selectedPlan && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.1"
              step="any"
              value={contribution ?? 1}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                onChange(planId, isNaN(num) || num <= 0 ? 1 : num);
              }}
              placeholder="1"
              className="w-20 px-3 py-2 rounded-lg bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#242A35] dark:border-[#242A35] light:border-neutral-300 text-xs font-mono text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138] text-center"
            />
            <span className="text-[11px] font-mono text-neutral-400 truncate">
              {selectedPlan.unitLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
