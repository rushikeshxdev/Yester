import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDisplayDate, formatDateKey, parseDateKey } from '../../utils/dateUtils';
import {
  getOrCreateDailyRecord,
  saveDailyRecord,
  deleteDailyRecord,
  deleteWorkEntry,
  deleteFitnessEntry,
  deleteLearningEntry,
  deleteProjectEntry,
  deletePersonalEntry,
  updateHealthEntry,
} from '../../services/storage';
import { ActivityCategory } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { WorkSection } from '../daily/WorkSection';
import { FitnessSection } from '../daily/FitnessSection';
import { LearningSection } from '../daily/LearningSection';
import { ProjectsSection } from '../daily/ProjectsSection';
import { PersonalSection } from '../daily/PersonalSection';
import { HealthSection } from '../daily/HealthSection';
import { ReflectionSection } from '../daily/ReflectionSection';
import { DailyEntryModal } from '../daily/DailyEntryModal';

export const DailyRecordView: React.FC = () => {
  const {
    selectedDate,
    selectDate,
    navigateToCalendar,
    records,
  } = useLifeOS();
  const { reducedMotion } = useTheme();

  const record = records[selectedDate] || getOrCreateDailyRecord(selectedDate);
  const { dayOfWeek, dayNumber, monthName, year } = formatDisplayDate(selectedDate);

  // Modal state for adding/editing records
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<ActivityCategory | 'reflection'>('work');
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Inline summary editing state
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryInput, setSummaryInput] = useState(record.summary || '');

  // Next / Previous day navigation
  const dateParts = parseDateKey(selectedDate);
  const currentDateObj = new Date(dateParts.year, dateParts.month - 1, dateParts.day);

  const prevDateObj = new Date(currentDateObj);
  prevDateObj.setDate(currentDateObj.getDate() - 1);
  const prevDateKey = formatDateKey(
    prevDateObj.getFullYear(),
    prevDateObj.getMonth() + 1,
    prevDateObj.getDate()
  );

  const nextDateObj = new Date(currentDateObj);
  nextDateObj.setDate(currentDateObj.getDate() + 1);
  const nextDateKey = formatDateKey(
    nextDateObj.getFullYear(),
    nextDateObj.getMonth() + 1,
    nextDateObj.getDate()
  );

  const handleOpenAddModal = (category: ActivityCategory | 'reflection') => {
    setModalCategory(category);
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (category: ActivityCategory | 'reflection', entry: any) => {
    setModalCategory(category);
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleSaveSummary = () => {
    saveDailyRecord({
      ...record,
      summary: summaryInput.trim() || undefined,
    });
    setIsEditingSummary(false);
  };

  const handleToggleHabit = (habitId: string) => {
    if (!record.health) return;
    const updatedHabits = record.health.habits.map((h) =>
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    updateHealthEntry(selectedDate, {
      ...record.health,
      habits: updatedHabits,
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-white dark:bg-[#0B0B0B] text-neutral-900 dark:text-white select-text pb-20">
      {/* Editorial Journal Paper Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* Top Control Bar: Back, Date Switcher, Delete */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#222222]">
          <button
            onClick={navigateToCalendar}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Calendar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => selectDate(prevDateKey)}
              className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300">
              {dayNumber} {monthName.slice(0, 3)} {year}
            </span>
            <button
              onClick={() => selectDate(nextDateKey)}
              className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editorial Journal Header */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.25 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-500 font-semibold">
              {dayOfWeek} &bull; {monthName} {dayNumber}, {year}
            </span>
            {record.isSampleData && (
              <Badge variant="muted" size="sm">
                Demonstration Record
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
            Daily Journal & Ledger
          </h1>

          {/* Daily Headline / Summary */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-[#242424]">
            {isEditingSummary ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  placeholder="Summarize the core themes and accomplishments of this day..."
                  className="w-full px-3 py-2 text-xs font-mono rounded border border-neutral-300 dark:border-[#2A2A2A] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSummaryInput(record.summary || '');
                      setIsEditingSummary(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" onClick={handleSaveSummary}>
                    Save Summary
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs sm:text-sm font-mono text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                  {record.summary ? `&ldquo;${record.summary}&rdquo;` : 'No daily executive summary written yet.'}
                </p>
                <button
                  onClick={() => {
                    setSummaryInput(record.summary || '');
                    setIsEditingSummary(true);
                  }}
                  className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white shrink-0 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{record.summary ? 'Edit' : 'Add Summary'}</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sections A to G: Clean Vertical Flow */}
        <div className="space-y-12">
          {/* Section A: Work & Professional */}
          <WorkSection
            entries={record.work || []}
            onAdd={() => handleOpenAddModal('work')}
            onEdit={(entry) => handleOpenEditModal('work', entry)}
            onDelete={(id) => deleteWorkEntry(selectedDate, id)}
          />

          {/* Section B: Physical & Fitness */}
          <FitnessSection
            entries={record.fitness || []}
            onAdd={() => handleOpenAddModal('fitness')}
            onEdit={(entry) => handleOpenEditModal('fitness', entry)}
            onDelete={(id) => deleteFitnessEntry(selectedDate, id)}
          />

          {/* Section C: Learning & Education */}
          <LearningSection
            entries={record.learning || []}
            onAdd={() => handleOpenAddModal('learning')}
            onEdit={(entry) => handleOpenEditModal('learning', entry)}
            onDelete={(id) => deleteLearningEntry(selectedDate, id)}
          />

          {/* Section D: Personal Projects */}
          <ProjectsSection
            entries={record.projects || []}
            onAdd={() => handleOpenAddModal('project')}
            onEdit={(entry) => handleOpenEditModal('project', entry)}
            onDelete={(id) => deleteProjectEntry(selectedDate, id)}
          />

          {/* Section E: Personal Life */}
          <PersonalSection
            entries={record.personal || []}
            onAdd={() => handleOpenAddModal('personal')}
            onEdit={(entry) => handleOpenEditModal('personal', entry)}
            onDelete={(id) => deletePersonalEntry(selectedDate, id)}
          />

          {/* Section F: Health & Habits */}
          <HealthSection
            health={record.health}
            onEdit={() => handleOpenAddModal('health')}
            onToggleHabit={handleToggleHabit}
          />

          {/* Section G: Daily Reflection */}
          <ReflectionSection
            reflection={record.reflection}
            onEdit={() => handleOpenAddModal('reflection')}
          />
        </div>

        {/* Danger zone / bottom options */}
        <div className="pt-8 border-t border-neutral-200 dark:border-[#202020] flex items-center justify-between text-xs font-mono text-neutral-400">
          <button
            onClick={() => {
              if (window.confirm('Delete all records for this entire day?')) {
                deleteDailyRecord(selectedDate);
              }
            }}
            className="hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear This Day&apos;s Records</span>
          </button>

          <button
            onClick={navigateToCalendar}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Back to Calendar Grid &uarr;
          </button>
        </div>
      </div>

      {/* Daily Entry Modal */}
      {modalOpen && (
        <DailyEntryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          dateKey={selectedDate}
          category={modalCategory}
          existingEntry={editingEntry}
        />
      )}
    </div>
  );
};
