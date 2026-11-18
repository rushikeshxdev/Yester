import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Plus,
  ArrowLeft,
  Camera,
  X,
  Compass,
  AlertCircle,
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

const COVER_PRESETS = [
  {
    id: 'sunset',
    label: 'Sunset Skyline',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mountains',
    label: 'Misty Mountains',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'desk',
    label: 'Studio Workspace',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'library',
    label: 'Classic Library',
    url: 'https://images.unsplash.com/photo-1507842229452-9f66679234b6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cafe',
    label: 'Rainy Café',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'forest',
    label: 'Pine Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  },
];

export const DailyRecordView: React.FC = () => {
  const {
    selectedDate,
    selectDate,
    records,
    openQuickCapture,
    previousScreen,
    navigateToSearch,
  } = useLifeOS();
  const { reducedMotion } = useTheme();

  const record = records[selectedDate] || getOrCreateDailyRecord(selectedDate);
  const { dayOfWeek, dayNumber, monthName, year } = formatDisplayDate(selectedDate);

  // Modal state for adding/editing records
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<ActivityCategory | 'reflection'>('work');
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Cover image modal state
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [coverError, setCoverError] = useState('');

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

  // Yesterday's priorities & habits
  const yesterdayRecord = records[prevDateKey];
  const yesterdayPriorities = yesterdayRecord?.reflection?.prioritiesTomorrow || [];
  const [dismissedYesterdayBrief, setDismissedYesterdayBrief] = useState(false);
  const [addressedPriorities, setAddressedPriorities] = useState<Set<number>>(new Set());

  // Copy yesterday's habits
  const yesterdayHabits = yesterdayRecord?.health?.habits || [];
  const handleCopyYesterdayHabits = () => {
    if (yesterdayHabits.length === 0) return;
    const now = new Date().toISOString();
    const currentHealth = record.health || {
      id: `health-${Date.now()}`,
      date: selectedDate,
      sleepHours: 7.5,
      waterIntakeLiters: 2.5,
      habits: [],
      createdAt: now,
      updatedAt: now,
    };

    const copiedHabits = yesterdayHabits.map((h) => ({
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: h.name,
      completed: false,
    }));

    updateHealthEntry(selectedDate, {
      ...currentHealth,
      habits: copiedHabits,
    });
  };

  const handlePromoteToWork = (priorityText: string) => {
    setModalCategory('work');
    setEditingEntry({
      id: `work-${Date.now()}`,
      date: selectedDate,
      organization: 'Priority Focus',
      project: priorityText.length > 30 ? priorityText.substring(0, 30) + '...' : priorityText,
      tasksPerformed: [priorityText],
      technologiesUsed: [],
      evidenceLinks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  const handlePromoteToProject = (priorityText: string) => {
    setModalCategory('project');
    setEditingEntry({
      id: `proj-${Date.now()}`,
      date: selectedDate,
      projectName: priorityText.length > 25 ? priorityText.substring(0, 25) + '...' : priorityText,
      objective: priorityText,
      tasksCompleted: [priorityText],
      progressPercentage: 50,
      repositoryLinks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

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

  const handleSelectCover = (url: string) => {
    saveDailyRecord({
      ...record,
      coverImage: url,
    });
    setIsCoverModalOpen(false);
    setCoverError('');
  };

  const handleSaveCustomCover = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customCoverUrl.trim();
    if (!url) return;

    if (url.startsWith('data:image/') || url.length > 2048) {
      setCoverError('Base64 images and URLs over 2,048 characters are disabled to protect offline local storage quota. Please enter a valid HTTPS image URL.');
      return;
    }

    if (!/^https?:\/\/.+/i.test(url)) {
      setCoverError('Please provide a valid HTTP/HTTPS image URL.');
      return;
    }

    handleSelectCover(url);
    setCustomCoverUrl('');
  };

  // Category counts and navigation metadata for all 7 sections (Concept Panel 5)
  const categoryPills = useMemo(
    () => [
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
        category: 'project',
        label: 'Projects',
        count: record.projects?.length || 0,
        color: '#A371F7',
      },
      {
        category: 'personal',
        label: 'Personal',
        count: record.personal?.length || 0,
        color: '#E5A84B',
      },
      {
        category: 'health',
        label: 'Health',
        count: (record.health?.habits?.length || 0) + (record.health?.customMetrics?.length || 0),
        color: '#2EA043',
      },
      {
        category: 'reflection',
        label: 'Reflection',
        count:
          record.reflection?.wentWell ||
          record.reflection?.learned ||
          record.reflection?.freeformNotes
            ? 1
            : 0,
        color: '#D29922',
      },
    ],
    [record]
  );

  // Horizontal slider active category state and references
  const [activeCategory, setActiveCategory] = useState<string>('work');
  const sliderRef = useRef<HTMLDivElement>(null);
  const pillsBarRef = useRef<HTMLDivElement>(null);

  const activeSlideIndex = useMemo(() => {
    const idx = categoryPills.findIndex((p) => p.category === activeCategory);
    return idx >= 0 ? idx : 0;
  }, [categoryPills, activeCategory]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    if (!sliderRef.current) return;
    const targetElement = document.getElementById(`section-${category}`);
    if (targetElement) {
      const slider = sliderRef.current;
      const sliderRect = slider.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const offset = targetRect.left - sliderRect.left + slider.scrollLeft;
      slider.scrollTo({
        left: offset,
        behavior: 'smooth',
      });
    }

    // Also bring the active pill into view if needed
    const pillElement = document.getElementById(`pill-${category}`);
    if (pillElement && pillsBarRef.current) {
      pillElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  };

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const scrollLeft = slider.scrollLeft;
    const width = slider.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      const matchedPill = categoryPills[index];
      if (matchedPill && matchedPill.category !== activeCategory) {
        setActiveCategory(matchedPill.category);
      }
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      scrollToCategory(categoryPills[activeSlideIndex - 1].category);
    }
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < categoryPills.length - 1) {
      scrollToCategory(categoryPills[activeSlideIndex + 1].category);
    }
  };

  const currentHeadline =
    record.summary ||
    record.reflection?.freeformNotes ||
    'A productive day and a clear mind.';

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#090A0C] dark:bg-[#090A0C] light:bg-[#FCFCFC] text-white dark:text-white light:text-neutral-900 select-text pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Breadcrumb Return to Search if arrived from Search */}
        {previousScreen === 'search' && (
          <button
            onClick={navigateToSearch}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#FF7138] hover:text-[#FF8D5C] transition-colors cursor-pointer group -mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>&larr; Return to Search Results</span>
          </button>
        )}

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
                  className="w-full px-3 py-2 text-sm font-serif rounded-lg border border-[#2B3340] dark:border-[#2B3340] light:border-[#D7D5CE] bg-[#14181F] dark:bg-[#14181F] light:bg-[#FFFFFF] text-white dark:text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
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
          <div
            onClick={() => setIsCoverModalOpen(true)}
            className="md:col-span-5 h-40 rounded-xl overflow-hidden relative group border border-[#222731] shadow-inner bg-[#14181F] cursor-pointer"
            title="Click to personalize cover visual"
          >
            {/* Ambient aesthetic memory image */}
            <img
              src={record.coverImage || COVER_PRESETS[0].url}
              alt="Day Memory Cover"
              onError={(e) => {
                e.currentTarget.src = COVER_PRESETS[0].url;
              }}
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-[#FF7138]" />
                <span>Personalize Visual</span>
              </span>
              <span className="opacity-75">{selectedDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Category Navigation Pills Bar (Concept Panel 5) */}
        <div
          ref={pillsBarRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
        >
          {categoryPills.map((pill) => {
            const hasEntries = pill.count > 0;
            const isActive = activeCategory === pill.category;
            return (
              <div
                id={`pill-${pill.category}`}
                key={pill.category}
                className={`group flex items-center rounded-xl text-xs font-sans transition-all border shrink-0 ${
                  isActive
                    ? 'bg-[#1C222C] text-white border-[#FF7138] ring-1 ring-[#FF7138]/60 shadow-md light:bg-[#FCE9E0] light:border-[#E95D2B] light:text-[#191B20]'
                    : hasEntries
                    ? 'bg-[#14181F] text-white border-[#232934] shadow-sm light:bg-[#FFFFFF] light:border-[#E5E3DC] light:text-[#191B20] hover:border-neutral-500'
                    : 'bg-[#0E1115] text-neutral-500 border-[#1A1F26] hover:text-neutral-300 light:bg-[#F8F7F4] light:border-[#E5E3DC] light:text-[#626872]'
                }`}
              >
                {/* Clicking category title & count navigates directly to that section */}
                <button
                  type="button"
                  onClick={() => scrollToCategory(pill.category)}
                  className="flex items-center gap-2 pl-3.5 pr-2 py-2 cursor-pointer focus:outline-none"
                  title={`Slide to ${pill.label}`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: pill.color }}
                  />
                  <span className="font-medium whitespace-nowrap">{pill.label}</span>
                  <span className="font-mono text-[11px] opacity-70 whitespace-nowrap">
                    {pill.count} {pill.count === 1 ? 'entry' : 'entries'}
                  </span>
                </button>

                {/* Dedicated '+' button to create new entry for this category */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAddModal(pill.category as ActivityCategory | 'reflection');
                  }}
                  className="px-2.5 py-2 text-neutral-400 hover:text-[#FF7138] dark:hover:text-[#FF7138] light:hover:text-[#E95D2B] transition-colors cursor-pointer border-l border-white/10 dark:border-white/10 light:border-black/10 flex items-center justify-center"
                  title={`+ Add new ${pill.label} entry`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Yesterday's Intent ➔ Today's Brief Banner (Section 11.1) */}
        {!dismissedYesterdayBrief && yesterdayPriorities.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#0F1318] dark:bg-[#0F1318] light:bg-neutral-50 border border-[#232A35] dark:border-[#232A35] light:border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#FF7138]/10 text-[#FF7138]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white dark:text-white light:text-neutral-900 flex items-center gap-2">
                    <span>Yesterday's Intent &bull; Today's Brief</span>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      (from {prevDateKey} reflection)
                    </span>
                  </h3>
                  <p className="text-[11px] font-sans text-neutral-400">
                    Priorities established yesterday waiting for today's action.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDismissedYesterdayBrief(true)}
                className="text-xs font-mono text-neutral-500 hover:text-white dark:hover:text-white light:hover:text-black transition-colors"
                title="Dismiss brief"
              >
                Dismiss
              </button>
            </div>

            <div className="space-y-2">
              {yesterdayPriorities.map((priority, idx) => {
                const isAddressed = addressedPriorities.has(idx);
                return (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                      isAddressed
                        ? 'bg-[#14181F]/50 border-[#1E232B] opacity-60 light:bg-[#F8F7F4]/60 light:border-[#E5E3DC]'
                        : 'bg-[#14181F] border-[#222833] light:bg-[#F8F7F4] light:border-[#E5E3DC] light:text-[#191B20]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1F2633] text-[#FF7138] font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-xs font-sans ${
                          isAddressed
                            ? 'line-through text-neutral-500'
                            : 'text-white dark:text-white light:text-neutral-900 font-medium'
                        }`}
                      >
                        {priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-auto self-end">
                      <button
                        onClick={() => handlePromoteToWork(priority)}
                        className="px-2.5 py-1 rounded bg-[#1C222B] hover:bg-[#252D3A] text-[10px] font-mono text-neutral-300 hover:text-white transition-colors light:bg-[#FFFFFF] light:border light:border-[#D7D5CE] light:text-[#191B20] light:hover:border-[#E95D2B]"
                      >
                        + Work
                      </button>
                      <button
                        onClick={() => handlePromoteToProject(priority)}
                        className="px-2.5 py-1 rounded bg-[#1C222B] hover:bg-[#252D3A] text-[10px] font-mono text-neutral-300 hover:text-white transition-colors light:bg-[#FFFFFF] light:border light:border-[#D7D5CE] light:text-[#191B20] light:hover:border-[#E95D2B]"
                      >
                        + Project
                      </button>
                      <button
                        onClick={() => {
                          const updated = new Set(addressedPriorities);
                          if (updated.has(idx)) {
                            updated.delete(idx);
                          } else {
                            updated.add(idx);
                          }
                          setAddressedPriorities(updated);
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                          isAddressed
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#1C222B] hover:bg-[#252D3A] text-neutral-400 light:bg-[#FFFFFF] light:border light:border-[#D7D5CE] light:text-[#191B20] light:hover:border-[#E95D2B]'
                        }`}
                      >
                        {isAddressed ? '✓ Addressed' : 'Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Horizontal Editorial Sections Slider */}
        <div className="space-y-4 pt-2">
          {/* Header Controls: Active Section Indicator & Slide Navigation */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-600 font-bold flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: categoryPills[activeSlideIndex]?.color || '#FF7138' }}
                />
                <span>Section: {categoryPills[activeSlideIndex]?.label}</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-normal">
                ({activeSlideIndex + 1} of {categoryPills.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSlide}
                disabled={activeSlideIndex === 0}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#232934] dark:border-[#232934] light:border-neutral-200 bg-[#14181F] dark:bg-[#14181F] light:bg-white text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF7138] transition-colors cursor-pointer shadow-sm"
                title="Slide to Previous Category"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={handleNextSlide}
                disabled={activeSlideIndex === categoryPills.length - 1}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#232934] dark:border-[#232934] light:border-neutral-200 bg-[#14181F] dark:bg-[#14181F] light:bg-white text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF7138] transition-colors cursor-pointer shadow-sm"
                title="Slide to Next Category"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Horizontal Slide Track */}
          <div
            ref={sliderRef}
            onScroll={handleSliderScroll}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 pt-1 scrollbar-none"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {/* Section A: Work & Professional */}
            <div
              id="section-work"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <WorkSection
                entries={record.work || []}
                onAdd={() => handleOpenAddModal('work')}
                onEdit={(entry) => handleOpenEditModal('work', entry)}
                onDelete={(id) => deleteWorkEntry(selectedDate, id)}
              />
            </div>

            {/* Section B: Physical & Fitness */}
            <div
              id="section-fitness"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <FitnessSection
                entries={record.fitness || []}
                onAdd={() => handleOpenAddModal('fitness')}
                onEdit={(entry) => handleOpenEditModal('fitness', entry)}
                onDelete={(id) => deleteFitnessEntry(selectedDate, id)}
              />
            </div>

            {/* Section C: Learning & Education */}
            <div
              id="section-learning"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <LearningSection
                entries={record.learning || []}
                onAdd={() => handleOpenAddModal('learning')}
                onEdit={(entry) => handleOpenEditModal('learning', entry)}
                onDelete={(id) => deleteLearningEntry(selectedDate, id)}
              />
            </div>

            {/* Section D: Personal Projects */}
            <div
              id="section-project"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <ProjectsSection
                entries={record.projects || []}
                onAdd={() => handleOpenAddModal('project')}
                onEdit={(entry) => handleOpenEditModal('project', entry)}
                onDelete={(id) => deleteProjectEntry(selectedDate, id)}
              />
            </div>

            {/* Section E: Personal Life */}
            <div
              id="section-personal"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <PersonalSection
                entries={record.personal || []}
                onAdd={() => handleOpenAddModal('personal')}
                onEdit={(entry) => handleOpenEditModal('personal', entry)}
                onDelete={(id) => deletePersonalEntry(selectedDate, id)}
              />
            </div>

            {/* Section F: Health & Vitals */}
            <div
              id="section-health"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <HealthSection
                health={record.health}
                onEdit={() => handleOpenAddModal('health')}
                onToggleHabit={handleToggleHabit}
                onCopyYesterdayHabits={handleCopyYesterdayHabits}
                yesterdayHabitsCount={yesterdayHabits.length}
              />
            </div>

            {/* Section G: Evening Reflection */}
            <div
              id="section-reflection"
              className="w-full min-w-full shrink-0 snap-start"
            >
              <ReflectionSection
                reflection={record.reflection}
                onEdit={() => handleOpenAddModal('reflection')}
              />
            </div>
          </div>
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

      {/* Cover Image Personalization Modal */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div
            className="w-full max-w-lg rounded-2xl bg-[#0D0F13] dark:bg-[#0D0F13] light:bg-white border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200">
              <div>
                <h3 className="text-base font-serif text-white dark:text-white light:text-neutral-900">
                  Personalize Day Cover Visual
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  Select an atmospheric curation or paste your own URL
                </p>
              </div>
              <button
                onClick={() => setIsCoverModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectCover(preset.url)}
                  className="group relative h-20 rounded-xl overflow-hidden border border-[#222833] dark:border-[#222833] light:border-neutral-200 hover:border-[#FF7138] transition-all cursor-pointer"
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-[10px] font-sans text-white/90 line-clamp-1">
                      {preset.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleSaveCustomCover} className="pt-2 space-y-2">
              <label className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600 block">
                Or Custom Image URL
              </label>
              {coverError && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 bg-red-950/30 border border-red-500/30 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{coverError}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#14181F] dark:bg-[#14181F] light:bg-neutral-100 border border-[#232934] dark:border-[#232934] light:border-neutral-300 text-xs text-white dark:text-white light:text-neutral-900 focus:outline-none focus:border-[#FF7138]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF7138] hover:bg-[#FF8352] text-white text-xs font-medium cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
