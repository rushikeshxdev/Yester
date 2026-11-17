import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  Archive,
  Trash2,
  Calendar,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useLifeOS } from '../../context/LifeOSContext';
import { calculatePlanProgress } from '../../services/planService';
import { Button } from '../common/Button';
import { PlanFormModal } from '../plans/PlanFormModal';
import { LifePlan } from '../../types';

export const PlanDetailView: React.FC = () => {
  const {
    activePlan,
    records,
    navigateToPlans,
    navigateToJournal,
    openQuickCapture,
    updatePlan,
    archivePlan,
    completePlan,
    deletePlan,
  } = useLifeOS();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const progressSummary = useMemo(() => {
    if (!activePlan) return null;
    return calculatePlanProgress(activePlan, records, todayStr);
  }, [activePlan, records, todayStr]);

  if (!activePlan || !progressSummary) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="text-sm font-mono text-neutral-400">Plan not found or no longer active.</p>
        <Button variant="secondary" size="sm" onClick={navigateToPlans} className="font-mono text-xs">
          Return to Plans
        </Button>
      </div>
    );
  }

  const {
    plan,
    actualValue,
    actualPercent,
    expectedValue,
    expectedPercent,
    varianceValue,
    variancePercent,
    paceStatus,
    totalDays,
    elapsedDays,
    remainingDays,
    milestones,
    linkedEntries,
    chartData,
  } = progressSummary;

  const handleToggleComplete = () => {
    if (plan.status === 'completed') {
      updatePlan({ ...plan, status: 'active' });
    } else {
      completePlan(plan.id);
    }
  };

  const handleToggleArchive = () => {
    if (plan.status === 'archived') {
      updatePlan({ ...plan, status: 'active' });
    } else {
      archivePlan(plan.id);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the plan "${plan.title}"? Your daily recorded entries will be preserved.`
      )
    ) {
      deletePlan(plan.id);
    }
  };

  const handleUpdate = (updated: LifePlan) => {
    updatePlan(updated);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-[#090A0C] dark:bg-[#090A0C] light:bg-[#FCFCFC] text-white dark:text-white light:text-neutral-900 pb-24 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb Back */}
        <button
          onClick={navigateToPlans}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#FF7138] hover:text-[#FF8D5C] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>&larr; Return to Life Plans Portfolio</span>
        </button>

        {/* Dossier Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#181D25] dark:bg-[#181D25] light:bg-neutral-200 text-[#FF7138] font-bold border border-[#242A35]">
                {plan.category}
              </span>
              <span className="text-neutral-500 font-mono text-xs">&bull;</span>
              <span className="text-xs font-mono text-neutral-400 capitalize">
                {plan.pacingType.replace('_', ' ')} Cadence
              </span>
              {plan.status !== 'active' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase font-semibold">
                  {plan.status}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-white dark:text-white light:text-neutral-900 font-normal tracking-tight">
              {plan.title}
            </h1>

            <p className="text-sm font-sans text-neutral-300 dark:text-[#C5C8D0] light:text-neutral-700 leading-relaxed italic font-serif">
              &ldquo;{plan.statement}&rdquo;
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit2 className="w-3.5 h-3.5 text-neutral-400" />}
              className="font-mono text-xs"
            >
              Edit
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleComplete}
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              className="font-mono text-xs"
            >
              {plan.status === 'completed' ? 'Reopen Plan' : 'Mark Achieved'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleArchive}
              icon={<Archive className="w-3.5 h-3.5 text-neutral-400" />}
              className="font-mono text-xs"
            >
              {plan.status === 'archived' ? 'Unarchive' : 'Archive'}
            </Button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-[#1E232B] light:hover:bg-red-50 light:hover:text-red-600 transition-colors"
              title="Delete Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Card Comparison Dossier Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Actual Progress */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              Actual Achieved
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#FF7138]">
                {actualValue}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                / {plan.targetValue} {plan.unitLabel}
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              {actualPercent}% of intention target
            </div>
          </div>

          {/* Expected Today */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              Expected Today
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white dark:text-white light:text-neutral-900">
                {expectedValue}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {plan.unitLabel}
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              {expectedPercent}% along {plan.pacingType} curve
            </div>
          </div>

          {/* Pace Variance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              Pace Variance
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  paceStatus === 'ahead'
                    ? 'text-emerald-400'
                    : paceStatus === 'behind'
                    ? 'text-amber-400'
                    : 'text-neutral-200 dark:text-white light:text-neutral-900'
                }`}
              >
                {variancePercent > 0 ? `+${variancePercent}` : variancePercent}%
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                ({varianceValue > 0 ? `+${varianceValue}` : varianceValue} {plan.unitLabel})
              </span>
            </div>
            <div className="text-[11px] font-mono">
              {paceStatus === 'ahead' && (
                <span className="text-emerald-400 font-semibold">Ahead of Expected</span>
              )}
              {paceStatus === 'on_pace' && (
                <span className="text-neutral-400">Tracking On Pace</span>
              )}
              {paceStatus === 'behind' && (
                <span className="text-amber-400 font-semibold">Behind Trajectory</span>
              )}
            </div>
          </div>

          {/* Timeline Horizon */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-semibold">
              Timeline Horizon
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white dark:text-white light:text-neutral-900">
                {remainingDays > 0 ? remainingDays : 0}d
              </span>
              <span className="text-xs font-mono text-neutral-400">
                remaining
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-500">
              Day {elapsedDays} of {totalDays} ({plan.startDate} &rarr; {plan.targetDate})
            </div>
          </div>
        </div>

        {/* Expected vs Actual Trajectory AreaChart */}
        <div className="p-6 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 font-normal">
                Trajectory Analysis · Intent vs. Reality
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Continuous mathematical curve compared to cumulative logged effort.
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#FF7138] rounded-full" />
                <span className="text-white dark:text-white light:text-neutral-900 font-semibold">
                  Actual Recorded
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-neutral-400 border-b border-dashed border-white" />
                <span className="text-neutral-400">
                  Expected Curve
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7138" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF7138" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F242D" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  stroke="#5A616E"
                  tick={{ fontSize: 10, fill: '#7C8494' }}
                  tickFormatter={(val) => {
                    const parts = val.split('-');
                    return `${parts[1]}/${parts[2]}`;
                  }}
                />
                <YAxis
                  tickLine={false}
                  stroke="#5A616E"
                  tick={{ fontSize: 10, fill: '#7C8494' }}
                  domain={[0, Math.max(plan.targetValue, actualValue * 1.1)]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[#12151B] border border-[#242A35] shadow-xl text-xs font-mono space-y-1.5">
                          <div className="text-neutral-400 font-bold border-b border-[#1E232B] pb-1">
                            {data.date} (Day {data.dayIndex})
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[#FF7138]">Actual:</span>
                            <span className="font-bold text-white">
                              {data.actualValue !== null ? `${data.actualValue} ${plan.unitLabel}` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-neutral-400">Expected:</span>
                            <span className="text-white">
                              {data.expectedValue} {plan.unitLabel}
                            </span>
                          </div>
                          {data.dailyContribution > 0 && (
                            <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#1E232B] text-[10px] text-emerald-400">
                              <span>Logged on day:</span>
                              <span>+{data.dailyContribution} {plan.unitLabel}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="expectedValue"
                  stroke="#8B949E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="actualValue"
                  stroke="#FF7138"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualGradient)"
                  connectNulls={false}
                  dot={{ r: 2, fill: '#FF7138' }}
                  activeDot={{ r: 5, fill: '#FF7138', stroke: '#fff', strokeWidth: 2 }}
                />
                {/* Target Boundary Reference Line */}
                <ReferenceLine
                  y={plan.targetValue}
                  stroke="#FF7138"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                  label={{
                    value: `Target: ${plan.targetValue} ${plan.unitLabel}`,
                    fill: '#FF7138',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                {/* Current Date Indicator */}
                {todayStr >= plan.startDate && todayStr <= plan.targetDate && (
                  <ReferenceLine
                    x={todayStr}
                    stroke="#8B949E"
                    strokeDasharray="2 2"
                    strokeOpacity={0.6}
                    label={{
                      value: 'Today',
                      fill: '#8B949E',
                      fontSize: 10,
                      position: 'insideTopLeft',
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Empty state note if no actual activity logged yet */}
          {linkedEntries.length === 0 && (
            <div className="p-3 rounded-xl border border-dashed border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 bg-[#12151B]/40 text-center">
              <span className="text-[11px] font-mono text-neutral-400">
                Baseline Trajectory Only · No contributing daily records logged yet
              </span>
            </div>
          )}
        </div>

        {/* Milestones Progression Timeline */}
        <div className="p-6 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 font-normal">
                Milestones & Benchmarks
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Dynamically unlocked as daily record contributions aggregate.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {milestones.filter((m) => m.isReached).length} of {milestones.length} reached
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {milestones.map((m) => {
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${
                    m.isReached
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-[#14181F] dark:bg-[#14181F] light:bg-neutral-50 border-[#242A35] dark:border-[#242A35] light:border-neutral-200 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        m.isReached
                          ? 'bg-emerald-500 text-black'
                          : 'bg-[#1F2633] light:bg-[#EBE9E3] text-neutral-400 light:text-[#626872]'
                      }`}
                    >
                      {m.targetPercent}%
                    </span>
                    {m.isReached ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reached</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">Pending</span>
                    )}
                  </div>

                  <h4 className="text-sm font-sans font-semibold text-white dark:text-white light:text-neutral-900 line-clamp-1 mb-1">
                    {m.title}
                  </h4>

                  <div className="text-[11px] font-mono text-neutral-400">
                    Threshold: {m.targetValue} {plan.unitLabel}
                  </div>

                  {m.isReached && m.reachedDate && (
                    <div className="text-[10px] font-mono text-emerald-400/90 mt-2 pt-2 border-t border-emerald-500/20">
                      Crossed on {m.reachedDate} ({m.reachedValue} {plan.unitLabel})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Linked Daily Log Feed (Living Records) */}
        <div className="p-6 rounded-2xl bg-[#0E1116] dark:bg-[#0E1116] light:bg-white border border-[#1C2028] dark:border-[#1C2028] light:border-neutral-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 font-normal">
                Contributing Daily Entries ({linkedEntries.length})
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Every unit of actual progress is derived from sovereign daily records.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => openQuickCapture(plan.category)}
              icon={<Plus className="w-3.5 h-3.5 text-[#FF7138]" />}
              className="font-mono text-xs"
            >
              Log Effort
            </Button>
          </div>

          {linkedEntries.length > 0 ? (
            <div className="space-y-2 pt-2">
              {linkedEntries.map((entry) => (
                <div
                  key={entry.entryId}
                  onClick={() => navigateToJournal(entry.date)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#14181F] dark:bg-[#14181F] light:bg-neutral-50 border border-[#242A35] dark:border-[#242A35] light:border-neutral-200 hover:border-[#FF7138] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#1D232D] light:bg-[#F8F7F4] border border-transparent light:border-[#E5E3DC] text-neutral-400 group-hover:text-[#FF7138] transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white dark:text-white light:text-neutral-900">
                          {entry.date}
                        </span>
                        <span className="text-neutral-600">&bull;</span>
                        <span className="text-xs font-sans text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-medium">
                          {entry.title}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-[11px] font-sans text-neutral-400 line-clamp-1 mt-0.5">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#1F2633] text-[#FF7138] font-mono text-xs font-bold border border-[#2C3647]">
                      +{entry.contribution} {entry.unitLabel}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-[#1E232B] text-center space-y-2">
              <p className="text-xs font-mono text-neutral-400">
                No daily entries have been linked to this plan yet.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openQuickCapture(plan.category)}
                icon={<Plus className="w-3 h-3 text-[#FF7138]" />}
                className="text-xs font-mono"
              >
                Capture First Contributing Entry
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Plan Modal */}
      <PlanFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
        existingPlan={plan}
      />
    </div>
  );
};
