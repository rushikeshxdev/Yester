import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Sparkles,
  Plus,
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
  updateDailyReflection,
} from '../../services/storage';
import { ActivityCategory } from '../../types';
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
    records,
    openQuickCapture,
  } = useLifeOS();
  const { reducedMotion } = useTheme();

  const record = records[selectedDate] || getOrCreateDailyRecord(selectedDate);
  const { dayOfWeek, dayNumber, monthName, year } = formatDisplayDate(selectedDate);

  // Modal state for adding/editing records
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<ActivityCategory | 'reflection'>('work');
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Inline headline editing
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);
  const [headlineInput, setHeadlineInput] = useState(
    record.summary || record.reflection?.freeformNotes || ''
  );

  // Next / Previous day calculation
  const dateParts = parseDateKey(selectedDate);
  const currentDateObj = useMemo(
    () => new Date(dateParts.year, dateParts.month - 1, dateParts.day),
    [dateParts]
  );

  const dayOfYear = useMemo(() => {
    const startOfYear = new Date(currentDateObj.getFullYear(), 0, 1);
    const diff = currentDateObj.getTime() - startOfYear.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [currentDateObj]);

  const prevDateKey = useMemo(() => {
    const d = new Date(currentDateObj);
    d.setDate(currentDateObj.getDate() - 1);
    return formatDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }, [currentDateObj]);

  const nextDateKey = useMemo(() => {
    const d = new Date(currentDateObj);
    d.setDate(currentDateObj.getDate() + 1);
    return formatDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }, [currentDateObj]);

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

  const handleSaveHeadline = () => {
    const headline = headlineInput.trim() || undefined;
    const existingRefl = record.reflection || {
      id: `refl-${Date.now()}`,
      date: selectedDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (headline) {
      updateDailyReflection(selectedDate, {
        ...existingRefl,
        freeformNotes: headline,
      });

      saveDailyRecord({
        ...record,
        summary: headline,
      });
    }

    setIsEditingHeadline(false);
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

  // Category counts for the pill bar (Concept Panel 5)
  const categoryPills = [
    {
      category: 'work',
      label: 'Work',
      count: record.work?.length || 0,
      color: '#FF7138',
    },
    {
      category: 'fitness',
      label: 'Fitness',
      count: record.fitness?.length || 0,
      color: '#4A72B2',
    },
    {
      category: 'learning',
      label: 'Learning',
      count: record.learning?.length || 0,
      color: '#3FB950',
    },
    {
      category: 'personal',
      label: 'Personal',
      count: record.personal?.length || 0,
      color: '#E5A84B',
    },
    {
      category: 'projects',
      label: 'Projects',
      count: record.projects?.length || 0,
      color: '#A371F7',
    },
  ];

  const currentHeadline =
    record.summary ||
    record.reflection?.freeformNotes ||
    'A productive day and a clear mind.';

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#090A0C] dark:bg-[#090A0C] light:bg-[#FCFCFC] text-white dark:text-white light:text-neutral-900 select-text pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Temporal Day Pagination Header (Concept Panel 5) */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => selectDate(prevDateKey)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:bg-[#14181F] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-sm font-sans font-medium text-white dark:text-white light:text-neutral-900">
                {dayOfWeek}, {monthName} {dayNumber}, {year}
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">
                Day {dayOfYear} &bull; {year}
              </span>
            </div>

            <button
              onClick={() => selectDate(nextDateKey)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:bg-[#14181F] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openQuickCapture(undefined, selectedDate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF7138] hover:bg-[#FF8352] text-white text-xs font-medium tracking-wide shadow-orange-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Capture</span>
            </button>
          </div>
        </div>

        {/* Hero Editorial Header + Cover Visual (Concept Panel 5) */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.22 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 sm:p-7 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-xl"
        >
          {/* Left Column: Headline Epigraph */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF7138] font-semibold">
                DAILY THESIS
              </span>
            </div>

            {isEditingHeadline ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={headlineInput}
                  onChange={(e) => setHeadlineInput(e.target.value)}
                  placeholder="Enter a daily epigraph or headline..."
                  className="w-full px-3 py-2 text-sm font-serif rounded-lg border border-[#2B3340] bg-[#14181F] text-white focus:outline-none focus:border-[#FF7138]"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveHeadline}
                    className="px-3 py-1 rounded bg-[#FF7138] text-white text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingHeadline(false)}
                    className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group cursor-pointer" onClick={() => setIsEditingHeadline(true)}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-white dark:text-white light:text-neutral-900 tracking-tight leading-snug">
                  &ldquo;{currentHeadline}&rdquo;
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-500 group-hover:text-neutral-300 mt-2 transition-colors">
                  <Edit3 className="w-3 h-3" />
                  <span>Click to refine epigraph</span>
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Visual Memory Cover (Concept Panel 5) */}
          <div className="md:col-span-5 h-40 rounded-xl overflow-hidden relative group border border-[#222731] shadow-inner bg-[#14181F]">
            {/* Ambient aesthetic sunset skyline memory image */}
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
              alt="Day Memory Cover"
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FF7138]" />
                <span>Visual Memory</span>
              </span>
              <span className="opacity-75">{selectedDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Category Pills Row (Concept Panel 5) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categoryPills.map((pill) => {
            const hasEntries = pill.count > 0;
            return (
              <button
                key={pill.category}
                onClick={() => handleOpenAddModal(pill.category as ActivityCategory)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                  hasEntries
                    ? 'bg-[#14181F] text-white border border-[#232934] shadow-sm'
                    : 'bg-[#0E1115] text-neutral-500 border border-[#1A1F26] hover:text-neutral-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: pill.color }}
                />
                <span className="font-medium">{pill.label}</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {pill.count} {pill.count === 1 ? 'entry' : 'entries'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vertical Editorial Sections A to G */}
        <div className="space-y-10 pt-2">
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

          {/* Section F: Health & Vitals */}
          <HealthSection
            health={record.health}
            onEdit={() => handleOpenAddModal('health')}
            onToggleHabit={handleToggleHabit}
          />

          {/* Section G: Evening Reflection */}
          <ReflectionSection
            reflection={record.reflection}
            onEdit={() => handleOpenAddModal('reflection')}
          />
        </div>

        {/* Daily Record Footer Actions */}
        <div className="pt-8 border-t border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>Target Date: {selectedDate}</span>
          <button
            onClick={() => {
              if (window.confirm('Delete this complete day record? This action cannot be undone.')) {
                deleteDailyRecord(selectedDate);
              }
            }}
            className="flex items-center gap-1 text-red-500/80 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Daily Record</span>
          </button>
        </div>
      </div>

      {/* Daily Entry Modal for In-depth Editing */}
      <DailyEntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dateKey={selectedDate}
        category={modalCategory}
        existingEntry={editingEntry}
      />
    </div>
  );
};
