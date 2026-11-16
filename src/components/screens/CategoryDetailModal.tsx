import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ArrowUpRight,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { calculateMonthlyCategoryMetrics } from '../../services/analyticsService';
import { getMonthName, formatDisplayDate } from '../../utils/dateUtils';

export const CategoryDetailModal: React.FC = () => {
  const {
    activeCategoryModal,
    closeCategoryAnalytics,
    year,
    month,
    records,
    selectDate,
    openQuickCapture,
  } = useLifeOS();
  const { theme } = useTheme();

  if (!activeCategoryModal) return null;

  const metric = calculateMonthlyCategoryMetrics(activeCategoryModal, year, month, records);
  const hasData = metric.activeDaysCount > 0;
  const monthName = getMonthName(month);

  // Collect all entries in this month for this category
  const activeEntriesByDate: Array<{ date: string; entries: any[] }> = [];
  Object.keys(records)
    .sort()
    .reverse()
    .forEach((dateKey) => {
      const [y, m] = dateKey.split('-').map(Number);
      if (y === year && m === month) {
        const rec = records[dateKey];
        let items: any[] = [];
        if (activeCategoryModal === 'work') items = rec.work || [];
        else if (activeCategoryModal === 'fitness') items = rec.fitness || [];
        else if (activeCategoryModal === 'learning') items = rec.learning || [];
        else if (activeCategoryModal === 'project') items = rec.projects || [];
        else if (activeCategoryModal === 'personal') items = rec.personal || [];
        else if (activeCategoryModal === 'health' && rec.health) items = [rec.health];

        if (items.length > 0) {
          activeEntriesByDate.push({ date: dateKey, entries: items });
        }
      }
    });

  const handleOpenDay = (dateKey: string) => {
    closeCategoryAnalytics();
    selectDate(dateKey);
  };

  const handleLogNew = () => {
    closeCategoryAnalytics();
    openQuickCapture(activeCategoryModal);
  };

  return (
    <Modal
      isOpen={!!activeCategoryModal}
      onClose={closeCategoryAnalytics}
      title={`${metric.categoryLabel} — ${monthName} ${year}`}
      subtitle={`Detailed telemetry, activity logs, and historical trajectory`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-md border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818]">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">
              {metric.metric1.label}
            </div>
            <div className="text-2xl font-mono font-bold text-neutral-900 dark:text-white mt-1">
              {hasData ? metric.metric1.value : '0'}
            </div>
          </div>

          <div className="p-4 rounded-md border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818]">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">
              {metric.metric2.label}
            </div>
            <div className="text-2xl font-mono font-bold text-neutral-900 dark:text-white mt-1">
              {hasData ? metric.metric2.value : '0'}
            </div>
          </div>

          <div className="p-4 rounded-md border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818]">
            <div className="text-[11px] font-mono text-neutral-500 uppercase">
              {metric.metric3.label}
            </div>
            <div className="text-2xl font-mono font-bold text-neutral-900 dark:text-white mt-1">
              {hasData ? metric.metric3.value : '0'}
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="p-4 rounded-md border border-neutral-200 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#161616]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
              Daily Distribution (Days 1–31)
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              {hasData ? `${metric.activeDaysCount} active days recorded` : 'No data recorded'}
            </span>
          </div>

          {hasData ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metric.trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorMono" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={theme === 'dark' ? '#FFFFFF' : '#000000'}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme === 'dark' ? '#FFFFFF' : '#000000'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === 'dark' ? '#262626' : '#E5E5E5'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    stroke={theme === 'dark' ? '#666666' : '#999999'}
                    fontSize={10}
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#666666' : '#999999'}
                    fontSize={10}
                    fontFamily="monospace"
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#141414' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#2E2E2E' : '#E5E5E5',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      borderRadius: '4px',
                      color: theme === 'dark' ? '#FFFFFF' : '#000000',
                    }}
                    labelFormatter={(day) => `Day ${day} (${monthName})`}
                    formatter={(val) => [`${val} units/points`, 'Activity Metric']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme === 'dark' ? '#FFFFFF' : '#000000'}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorMono)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-300 dark:border-[#2C2C2C] rounded">
              <AlertCircle className="w-8 h-8 text-neutral-400 mb-2" />
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                No telemetry recorded for {metric.categoryLabel} in {monthName} {year}.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={handleLogNew}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="mt-3 text-xs font-mono"
              >
                Log First Entry
              </Button>
            </div>
          )}
        </div>

        {/* Detailed Activity Logs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
              Chronological Logs ({activeEntriesByDate.length} days)
            </h4>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleLogNew}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-mono"
            >
              Add Entry
            </Button>
          </div>

          {activeEntriesByDate.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeEntriesByDate.map(({ date, entries }) => {
                const { fullDateString } = formatDisplayDate(date);

                return (
                  <div
                    key={date}
                    className="p-3.5 rounded-md border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#161616] hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                        {fullDateString}
                      </span>
                      <button
                        onClick={() => handleOpenDay(date)}
                        className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Open Daily View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {entries.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="text-xs font-mono text-neutral-600 dark:text-neutral-300 pl-2 border-l-2 border-neutral-300 dark:border-[#333333]"
                        >
                          {/* Rendering preview depending on category */}
                          {activeCategoryModal === 'work' && (
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                                {item.organization} &bull; {item.project}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {item.outcomeImpact || item.tasksPerformed?.[0] || 'Work entry logged'}
                              </div>
                            </div>
                          )}

                          {activeCategoryModal === 'fitness' && (
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                                {item.workoutType} ({item.workoutDurationMinutes}m) &bull;{' '}
                                {item.muscleGroups?.join(', ')}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {item.exercises?.length
                                  ? `${item.exercises.length} exercises logged`
                                  : item.notes || 'Workout completed'}
                              </div>
                            </div>
                          )}

                          {activeCategoryModal === 'learning' && (
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                                {item.subject}: {item.technologyOrConcept}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {item.studyDurationMinutes}m &bull; {item.learningSource}
                              </div>
                            </div>
                          )}

                          {activeCategoryModal === 'project' && (
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                                {item.projectName}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {item.objective}
                              </div>
                            </div>
                          )}

                          {activeCategoryModal === 'personal' && (
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {item.description}
                              </div>
                            </div>
                          )}

                          {activeCategoryModal === 'health' && (
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                                Sleep: {item.sleepHours} hrs &bull; Water: {item.waterIntakeLiters}L
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                Habits completed: {item.habits?.filter((h: any) => h.completed).length || 0} /{' '}
                                {item.habits?.length || 0}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500 dark:text-neutral-500 text-xs font-mono">
              No daily entries to display.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
