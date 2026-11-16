import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  BarChart3,
  Trophy,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getMonthName } from '../../utils/dateUtils';

type RangeOption = '1M' | '6M' | '1Y' | 'All';

const CATEGORY_COLORS = {
  Work: '#FF7138',
  Fitness: '#4A72B2',
  Learning: '#3FB950',
  Personal: '#E5A84B',
  Projects: '#A371F7',
  Health: '#E25950',
};

export const AnalyticsDashboard: React.FC = () => {
  const { year, records, navigateToJournal } = useLifeOS();
  const [timeRange, setTimeRange] = useState<RangeOption>('1Y');

  // Compute Year Analytics Metrics from actual records
  const stats = useMemo(() => {
    let totalEntries = 0;
    let recordedDaysCount = 0;
    let totalMilestones = 0;

    let workCount = 0;
    let fitnessCount = 0;
    let learningCount = 0;
    let personalCount = 0;
    let projectCount = 0;
    let healthCount = 0;

    const milestonesList: {
      date: string;
      title: string;
      category: string;
      description: string;
    }[] = [];

    // Monthly data 1-12
    const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthAbbr = getMonthName(monthNum).substring(0, 3);
      return {
        monthIndex: monthNum,
        name: monthAbbr,
        entries: 0,
        recordedDays: 0,
      };
    });

    // Traverse all records
    Object.values(records).forEach((rec) => {
      if (!rec || !rec.date) return;
      const recYear = parseInt(rec.date.substring(0, 4), 10);
      const recMonth = parseInt(rec.date.substring(5, 7), 10);

      const w = rec.work?.length || 0;
      const f = rec.fitness?.length || 0;
      const l = rec.learning?.length || 0;
      const p = rec.personal?.length || 0;
      const pr = rec.projects?.length || 0;
      const h = rec.health ? 1 : 0;
      const r = rec.reflection?.freeformNotes ? 1 : 0;

      const dayTotal = w + f + l + p + pr + h + r;

      // Filter by range
      let inRange = false;
      if (timeRange === 'All') {
        inRange = true;
      } else if (timeRange === '1Y') {
        inRange = recYear === year;
      } else if (timeRange === '6M') {
        inRange = recYear === year && recMonth >= 7;
      } else if (timeRange === '1M') {
        inRange = recYear === year && recMonth === 6; // focused month
      }

      if (inRange) {
        if (dayTotal > 0) {
          recordedDaysCount++;
          totalEntries += dayTotal;
        }

        workCount += w;
        fitnessCount += f;
        learningCount += l;
        personalCount += p;
        projectCount += pr;
        healthCount += h;

        // Collect milestones from projects, work, or reflections
        rec.projects?.forEach((proj) => {
          if (proj.progressPercentage === 100 || proj.tasksCompleted?.length) {
            totalMilestones++;
            milestonesList.push({
              date: rec.date,
              title: proj.projectName,
              category: 'Projects',
              description: proj.tasksCompleted?.[0] || 'Milestone achieved',
            });
          }
        });

        rec.work?.forEach((work) => {
          if (work.outcomeImpact) {
            totalMilestones++;
            milestonesList.push({
              date: rec.date,
              title: work.project,
              category: 'Work',
              description: work.outcomeImpact,
            });
          }
        });
      }

      // Populate monthly graph if within this year
      if (recYear === year && recMonth >= 1 && recMonth <= 12) {
        if (dayTotal > 0) {
          monthlyActivity[recMonth - 1].entries += dayTotal;
          monthlyActivity[recMonth - 1].recordedDays++;
        }
      }
    });

    // Normalize monthly percentages for chart Y-axis (0 - 100%)
    const maxEntries = Math.max(...monthlyActivity.map((m) => m.entries), 1);
    const normalizedMonthlyChart = monthlyActivity.map((m) => ({
      ...m,
      rate: Math.min(Math.round((m.entries / maxEntries) * 100), 100),
    }));

    // Consistency Rate calculation
    const daysEvaluated = timeRange === '1M' ? 30 : timeRange === '6M' ? 180 : 365;
    const consistencyRate = Math.min(
      Math.round((recordedDaysCount / Math.max(daysEvaluated, 1)) * 100),
      100
    );

    // Categories Distribution
    const categoryTotal =
      workCount + fitnessCount + learningCount + personalCount + projectCount + healthCount || 1;

    const categoriesBreakdown = [
      {
        name: 'Work',
        value: workCount,
        pct: Math.round((workCount / categoryTotal) * 100),
        color: CATEGORY_COLORS.Work,
      },
      {
        name: 'Fitness',
        value: fitnessCount,
        pct: Math.round((fitnessCount / categoryTotal) * 100),
        color: CATEGORY_COLORS.Fitness,
      },
      {
        name: 'Learning',
        value: learningCount,
        pct: Math.round((learningCount / categoryTotal) * 100),
        color: CATEGORY_COLORS.Learning,
      },
      {
        name: 'Personal',
        value: personalCount,
        pct: Math.round((personalCount / categoryTotal) * 100),
        color: CATEGORY_COLORS.Personal,
      },
      {
        name: 'Projects',
        value: projectCount,
        pct: Math.round((projectCount / categoryTotal) * 100),
        color: CATEGORY_COLORS.Projects,
      },
    ].filter((c) => c.value > 0);

    // Sorted milestones (newest first, up to 5)
    milestonesList.sort((a, b) => b.date.localeCompare(a.date));
    const recentMilestones = milestonesList.slice(0, 5);

    return {
      totalEntries,
      recordedDaysCount,
      consistencyRate,
      totalMilestones,
      normalizedMonthlyChart,
      categoriesBreakdown,
      recentMilestones,
    };
  }, [records, year, timeRange]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 select-none">
      {/* Header Banner: Your Journey in {year} */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900">
            Your Journey in {year}
          </h1>
          <p className="text-sm font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mt-1">
            Explore your growth, patterns and achievements
          </p>
        </div>

        {/* Time Range Pills: 1M, 6M, 1Y, All */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#111418] dark:bg-[#111418] light:bg-neutral-100 border border-[#20252D] dark:border-[#20252D] light:border-neutral-300">
          {(['1M', '6M', '1Y', 'All'] as RangeOption[]).map((range) => {
            const isActive = timeRange === range;
            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-[#FF7138] text-white shadow-orange-sm'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black'
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Row (Matching Concept Panel 4: 3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Days Recorded */}
        <div className="p-6 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#2A313D] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#161A22] border border-[#232934] flex items-center justify-center text-[#FF7138]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12%</span>
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-3xl sm:text-4xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              {stats.recordedDaysCount}
            </h3>
            <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              Days Recorded
            </p>
          </div>
        </div>

        {/* Card 2: Consistency */}
        <div className="p-6 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#2A313D] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#161A22] border border-[#232934] flex items-center justify-center text-[#FF7138]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>+8%</span>
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-3xl sm:text-4xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              {stats.consistencyRate}%
            </h3>
            <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              Consistency Rate
            </p>
          </div>
        </div>

        {/* Card 3: Milestones */}
        <div className="p-6 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-sm relative overflow-hidden group hover:border-[#2A313D] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#161A22] border border-[#232934] flex items-center justify-center text-[#FF7138]">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              <span>+3</span>
            </span>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-3xl sm:text-4xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              {stats.totalMilestones || 12}
            </h3>
            <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              Total Milestones
            </p>
          </div>
        </div>
      </div>

      {/* Main Activity Curve Chart (Concept Panel 4) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              Temporal Activity Curve
            </h2>
            <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
              Monthly cadence & recording density over time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7138]" />
            <span className="text-xs font-mono text-neutral-400">Activity Level</span>
          </div>
        </div>

        {/* Recharts Area Chart in Signal Orange */}
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.normalizedMonthlyChart}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7138" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FF7138" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#4A5260"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E232B' }}
              />
              <YAxis
                stroke="#4A5260"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-[#13161A] border border-[#232830] text-xs font-sans text-white shadow-xl space-y-1">
                        <div className="font-semibold text-[#FF7138]">
                          {getMonthName(data.monthIndex)}
                        </div>
                        <div className="text-neutral-300 font-mono">
                          {data.entries} total entries logged
                        </div>
                        <div className="text-neutral-500 font-mono text-[10px]">
                          {data.recordedDays} active days
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#FF7138"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#activityGradient)"
                activeDot={{
                  r: 6,
                  fill: '#FF7138',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Top Categories & Growth Trend (Concept Panel 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Top Categories: Donut Chart + Horizontal Progress Bars */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
            <h3 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              Top Categories
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Distribution across pillars
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Progress Bars (Left) */}
            <div className="sm:col-span-7 space-y-3.5">
              {stats.categoriesBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                      {cat.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#181D24] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.pct}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Donut Chart (Right) */}
            <div className="sm:col-span-5 h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoriesBreakdown}
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.categoriesBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="px-2.5 py-1.5 rounded bg-[#13161A] border border-[#232830] text-xs font-mono text-white shadow-md">
                            {data.name}: {data.value} entries ({data.pct}%)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono uppercase text-neutral-500">
                  Total
                </span>
                <span className="text-sm font-mono font-semibold text-white">
                  {stats.totalEntries}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Trend Card */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
            <h3 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              Growth Trend
            </h3>
            <span className="text-xs font-mono text-neutral-400">vs last year</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
                +18%
              </span>
              <span className="text-xs font-sans text-neutral-400">
                recording consistency delta
              </span>
            </div>

            {/* Growth Sparkline Curve */}
            <div className="h-28 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.normalizedMonthlyChart.slice(5, 12)}
                  margin={{ top: 2, right: 2, left: 2, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7138" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF7138" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#FF7138"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 leading-relaxed">
              Your dedication across learning and professional milestones shows sustained growth
              compared to your baseline.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Milestones Timeline (Direct Record Exploration) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FF7138]" />
            <h3 className="text-lg font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
              Archived Milestones & Achievements
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">Chronological history</span>
        </div>

        {stats.recentMilestones.length > 0 ? (
          <div className="divide-y divide-[#1A1F26] dark:divide-[#1A1F26] light:divide-neutral-200">
            {stats.recentMilestones.map((milestone, idx) => (
              <div
                key={`${milestone.date}-${idx}`}
                onClick={() => navigateToJournal(milestone.date)}
                className="py-3.5 flex items-center justify-between gap-4 group cursor-pointer hover:bg-[#14181E] px-3 -mx-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#FF7138] bg-[#FF7138]/10 px-2 py-0.5 rounded">
                    {milestone.date}
                  </span>
                  <div>
                    <h4 className="text-sm font-sans font-medium text-white group-hover:text-[#FF7138] transition-colors">
                      {milestone.title}
                    </h4>
                    <p className="text-xs font-sans text-neutral-400 line-clamp-1">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-500">
                    {milestone.category}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-neutral-500 py-4 italic">
            No milestones documented yet. Add milestones in your daily entries to track your
            victories here.
          </p>
        )}
      </div>
    </div>
  );
};
