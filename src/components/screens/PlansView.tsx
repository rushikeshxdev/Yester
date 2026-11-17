import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { PlanStatus, LifePlan } from '../../types';
import { calculatePlanProgress } from '../../services/planService';
import { Button } from '../common/Button';
import { PlanFormModal } from '../plans/PlanFormModal';

const CATEGORY_COLORS: Record<string, string> = {
  work: '#FF7138',
  fitness: '#4A72B2',
  learning: '#3FB950',
  project: '#A371F7',
  personal: '#E5A84B',
};

export const PlansView: React.FC = () => {
  const { plans, records, navigateToPlanDetail, createPlan } = useLifeOS();
  const [statusFilter, setStatusFilter] = useState<PlanStatus>('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const allPlansList = useMemo(() => Object.values(plans), [plans]);

  // Summaries calculation for all plans
  const planSummaries = useMemo(() => {
    return allPlansList.map((plan) => calculatePlanProgress(plan, records, todayStr));
  }, [allPlansList, records, todayStr]);

  // Filtered by status tab
  const filteredSummaries = useMemo(() => {
    return planSummaries.filter((s) => s.plan.status === statusFilter);
  }, [planSummaries, statusFilter]);

  // Summary counts
  const activeSummaries = useMemo(
    () => planSummaries.filter((s) => s.plan.status === 'active'),
    [planSummaries]
  );
  const aheadCount = activeSummaries.filter((s) => s.paceStatus === 'ahead').length;
  const onPaceCount = activeSummaries.filter((s) => s.paceStatus === 'on_pace').length;
  const behindCount = activeSummaries.filter((s) => s.paceStatus === 'behind').length;

  const handleSavePlan = (newPlan: LifePlan) => {
    const saved = createPlan(newPlan);
    setIsCreateModalOpen(false);
    navigateToPlanDetail(saved.id);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#090A0C] dark:bg-[#090A0C] light:bg-[#FCFCFC] text-white dark:text-white light:text-neutral-900 pb-24 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF7138]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF7138] font-bold">
                Intentions & Trajectories
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-white dark:text-white light:text-neutral-900 font-normal tracking-tight">
              Life Plans
            </h1>
            <p className="text-xs sm:text-sm font-sans text-neutral-400 dark:text-[#A2A6AE] light:text-neutral-600 max-w-xl mt-1">
              Deliberate long-term intentions measured automatically against actual recorded daily execution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
              className="bg-[#FF7138] hover:bg-[#FF8352] text-white font-mono text-xs shadow-orange-sm"
            >
              Establish Plan
            </Button>
          </div>
        </div>

        {/* Telemetry Strip & Status Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12151B] dark:bg-[#12151B] light:bg-neutral-100 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 text-xs font-mono">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'active'
                  ? 'bg-[#FF7138] text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-black'
              }`}
            >
              Active ({planSummaries.filter((s) => s.plan.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-[#FF7138] text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-black'
              }`}
            >
              Completed ({planSummaries.filter((s) => s.plan.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'archived'
                  ? 'bg-[#FF7138] text-white font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-black'
              }`}
            >
              Archived ({planSummaries.filter((s) => s.plan.status === 'archived').length})
            </button>
          </div>

          {/* Active Cadence Telemetry Badges */}
          {statusFilter === 'active' && activeSummaries.length > 0 && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{aheadCount} Ahead</span>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 bg-[#161B22] dark:bg-[#161B22] light:bg-neutral-200 border border-[#242A35] px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                <span>{onPaceCount} On Pace</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-950/30 border border-amber-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{behindCount} Behind</span>
              </span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        {filteredSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSummaries.map((summary) => {
              const { plan, actualValue, actualPercent, expectedValue, expectedPercent, paceStatus, variancePercent, milestones, remainingDays } = summary;
              const categoryColor = CATEGORY_COLORS[plan.category] || '#FF7138';
              const reachedMilestonesCount = milestones.filter((m) => m.isReached).length;

              return (
                <div
                  key={plan.id}
                  onClick={() => navigateToPlanDetail(plan.id)}
                  className="group relative p-6 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 hover:border-neutral-600 dark:hover:border-neutral-500 light:hover:border-neutral-400 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    {/* Category & Pace Status header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                          {plan.category}
                        </span>
                        <span className="text-neutral-600">&bull;</span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          {plan.pacingType.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Variance Badge */}
                      {plan.status === 'active' && (
                        <div className="flex items-center gap-1">
                          {paceStatus === 'ahead' && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                              +{variancePercent}% Ahead
                            </span>
                          )}
                          {paceStatus === 'on_pace' && (
                            <span className="text-[10px] font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700 bg-[#161B22] dark:bg-[#161B22] light:bg-neutral-200 border border-[#242A35] px-2 py-0.5 rounded-full">
                              On Pace
                            </span>
                          )}
                          {paceStatus === 'behind' && (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                              {variancePercent}% Behind
                            </span>
                          )}
                        </div>
                      )}

                      {plan.status === 'completed' && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Achieved</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Statement */}
                    <div>
                      <h3 className="text-xl font-serif text-white dark:text-white light:text-neutral-900 group-hover:text-[#FF7138] transition-colors line-clamp-1">
                        {plan.title}
                      </h3>
                      <p className="text-xs font-sans text-neutral-400 dark:text-[#A2A6AE] light:text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                        {plan.statement}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Dual Pacing Track */}
                  <div className="space-y-2 pt-2 border-t border-[#181C23] dark:border-[#181C23] light:border-neutral-100">
                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <div>
                        <span className="text-base font-bold text-white dark:text-white light:text-neutral-900">
                          {actualValue}
                        </span>
                        <span className="text-neutral-400 text-xs ml-1">
                          / {plan.targetValue} {plan.unitLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#FF7138]">
                          {actualPercent}%
                        </span>
                        <span className="text-[10px] text-neutral-500 ml-1">
                          (Exp: {expectedValue} {plan.unitLabel} &bull; {expectedPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Dual Progress Track Bar */}
                    <div className="relative w-full h-2 rounded-full bg-[#181D26] dark:bg-[#181D26] light:bg-neutral-200 overflow-hidden">
                      {/* Actual Progress fill */}
                      <div
                        className="h-full bg-[#FF7138] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, actualPercent)}%` }}
                      />
                      {/* Expected Progress marker (subtle vertical line) */}
                      {expectedPercent > 0 && expectedPercent < 100 && (
                        <div
                          className="absolute top-0 bottom-0 w-[2px] bg-white shadow-sm z-10"
                          style={{ left: `${expectedPercent}%` }}
                          title={`Expected today: ${expectedPercent}%`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Footer Meta: Timeline & Milestones */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-2 border-t border-[#181C23] dark:border-[#181C23] light:border-neutral-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      <span>{remainingDays > 0 ? `${remainingDays}d remaining` : 'Target reached'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">
                        Milestones: {reachedMilestonesCount}/{milestones.length}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#FF7138] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Editorial Empty State */
          <div className="p-12 rounded-3xl border border-dashed border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-[#14181F] dark:bg-[#14181F] light:bg-neutral-100 border border-[#242A35] flex items-center justify-center mx-auto text-[#FF7138]">
              <Compass className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif text-white dark:text-white light:text-neutral-900">
                No {statusFilter} Life Plans Found
              </h3>
              <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
                Define an intention in Work, Fitness, Learning, Projects or Personal life to begin tracking reality against your plan.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#FF7138]" />}
              className="font-mono text-xs"
            >
              Establish New Plan
            </Button>
          </div>
        )}
      </div>

      {/* Plan Creation Modal */}
      <PlanFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSavePlan}
      />
    </div>
  );
};
