import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Target, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '../../../config/categoryTheme';

export interface PlanTimeSeriesPoint {
  date: string;
  actualCumulative: number;
  expectedCumulative: number;
  targetValue: number;
  dailyContribution: number;
}

export interface PlanAnalyticsItem {
  id: string;
  title: string;
  category: string;
  status: string;
  targetValue: number;
  unitLabel: string;
  startDate: string;
  targetDate: string;
  currentValue: number;
  progressPercent: number;
  expectedPercent: number;
  variancePercent: number;
  paceStatus: 'ahead' | 'on_pace' | 'behind';
  timeSeries: PlanTimeSeriesPoint[];
}

interface PlanProgressAreaProps {
  plans: PlanAnalyticsItem[];
  onPlanClick?: (planId: string) => void;
}

export const PlanProgressArea: React.FC<PlanProgressAreaProps> = ({
  plans,
  onPlanClick,
}) => {
  if (!plans || plans.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl text-center space-y-3">
        <Target className="w-8 h-8 text-neutral-600 mx-auto" />
        <h4 className="text-base font-serif text-white">No Active Life Plans</h4>
        <p className="text-xs font-sans text-neutral-400 max-w-sm mx-auto">
          Create an intentional Life Plan to begin tracking cumulative progress and trajectory pacing against your goals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E232B]">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FF7138]" />
            <h3 className="text-xl font-serif text-white tracking-tight">
              Life Plan Progress & Trajectories
            </h3>
          </div>
          <p className="text-xs font-sans text-neutral-400 mt-1">
            Cumulative contribution history vs expected mathematical trajectory curves
          </p>
        </div>
        <span className="text-xs font-mono text-neutral-400">
          {plans.length} {plans.length === 1 ? 'active plan' : 'active plans'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const color = getCategoryColor(plan.category);
          const catLabel = getCategoryLabel(plan.category);

          const renderPaceBadge = () => {
            switch (plan.paceStatus) {
              case 'ahead':
                return (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ahead (+{plan.variancePercent}%)</span>
                  </span>
                );
              case 'behind':
                return (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Behind ({plan.variancePercent}%)</span>
                  </span>
                );
              default:
                return (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-neutral-800/40 px-2 py-0.5 rounded-full border border-neutral-700/30">
                    <Clock className="w-3 h-3 text-[#FF7138]" />
                    <span>On Pace</span>
                  </span>
                );
            }
          };

          return (
            <div
              key={plan.id}
              onClick={() => onPlanClick && onPlanClick(plan.id)}
              className="p-6 rounded-2xl bg-[#0F1216] border border-[#1E232B] hover:border-[#2A313D] shadow-xl space-y-4 cursor-pointer group transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono uppercase px-2 py-0.5 rounded"
                      style={{
                        color,
                        backgroundColor: `${color}15`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {catLabel}
                    </span>
                    {renderPaceBadge()}
                  </div>
                  <h4 className="text-lg font-serif text-white group-hover:text-[#FF7138] transition-colors flex items-center gap-1">
                    <span>{plan.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF7138]" />
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-white">
                    {plan.currentValue}{' '}
                    <span className="text-xs font-sans text-neutral-400 font-normal">
                      / {plan.targetValue} {plan.unitLabel}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-400">
                    {plan.progressPercent}% achieved
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#181D24] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, plan.progressPercent)}%`,
                    backgroundColor: '#FF7138',
                  }}
                />
              </div>

              {/* Time Series Area Chart */}
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={plan.timeSeries}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`planGradient-${plan.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7138" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#FF7138" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="#475161"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val: string) => val.slice(5)}
                    />
                    <YAxis
                      stroke="#475161"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, plan.targetValue]}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as PlanTimeSeriesPoint;
                          return (
                            <div className="p-2.5 rounded-xl bg-[#12151B] border border-[#232934] text-xs font-mono shadow-xl space-y-1">
                              <p className="font-semibold text-white">{label}</p>
                              <p className="text-[#FF7138]">
                                Actual: {data.actualCumulative} {plan.unitLabel}
                              </p>
                              <p className="text-neutral-400">
                                Expected: {data.expectedCumulative} {plan.unitLabel}
                              </p>
                              {data.dailyContribution > 0 && (
                                <p className="text-emerald-400 text-[11px] pt-0.5 border-t border-neutral-800">
                                  +{data.dailyContribution} on this day
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Expected trajectory curve (dashed line) */}
                    <Line
                      type="monotone"
                      dataKey="expectedCumulative"
                      stroke="#64748B"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    {/* Actual cumulative progress area (Signal Orange) */}
                    <Area
                      type="stepAfter"
                      dataKey="actualCumulative"
                      stroke="#FF7138"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#planGradient-${plan.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Footer timeline info */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1 border-t border-[#1C2129]">
                <span>Started: {plan.startDate}</span>
                <span>Target: {plan.targetDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
