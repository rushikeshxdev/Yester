import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  FolderKanban,
  Heart,
  Activity,
  X,
  ArrowRight,
  Calendar,
  Check,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import {
  addOrUpdateWorkEntry,
  addOrUpdateFitnessEntry,
  addOrUpdateLearningEntry,
  addOrUpdateProjectEntry,
  addOrUpdatePersonalEntry,
  updateHealthEntry,
  updateDailyReflection,
  getOrCreateDailyRecord,
  saveDailyRecord,
} from '../../services/storage';
import { PlanLinkSelector } from '../daily-entry/shared/PlanLinkSelector';
import { PlanCategory } from '../../types';

type CategoryType = 'work' | 'fitness' | 'learning' | 'project' | 'personal' | 'health';

interface CategoryOption {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'work', label: 'Work', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'project', label: 'Project', icon: <FolderKanban className="w-5 h-5" /> },
  { id: 'personal', label: 'Personal', icon: <Heart className="w-5 h-5" /> },
  { id: 'health', label: 'Health', icon: <Activity className="w-5 h-5" /> },
];

export const QuickCaptureModal: React.FC = () => {
  const { quickCapture, closeQuickCapture } = useLifeOS();
  const [selectedCat, setSelectedCat] = useState<CategoryType>('work');
  const [noteText, setNoteText] = useState('');
  const [captureDate, setCaptureDate] = useState<string>(quickCapture.initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [planId, setPlanId] = useState<string | undefined>(undefined);
  const [planContribution, setPlanContribution] = useState<number | undefined>(undefined);
  const [logAnother, setLogAnother] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (quickCapture.isOpen) {
      setSelectedCat((quickCapture.initialCategory as CategoryType) || 'work');
      setCaptureDate(quickCapture.initialDate);
      setNoteText('');
      setPlanId(undefined);
      setPlanContribution(undefined);
      setSavedCount(0);
    }
  }, [quickCapture]);

  if (!quickCapture.isOpen) return null;

  const handleSave = () => {
    const text = noteText.trim() || 'Logged moment';
    const timestamp = new Date().toISOString();

    if (selectedCat === 'work') {
      addOrUpdateWorkEntry(captureDate, {
        id: `work-${Date.now()}`,
        date: captureDate,
        organization: 'Main Focus',
        project: text.length > 30 ? text.substring(0, 30) + '...' : text,
        tasksPerformed: [text],
        outcomeImpact: text,
        technologiesUsed: [],
        evidenceLinks: [],
        planId: planId || undefined,
        planContribution: planId ? (planContribution ?? 1) : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (selectedCat === 'fitness') {
      addOrUpdateFitnessEntry(captureDate, {
        id: `fit-${Date.now()}`,
        date: captureDate,
        workoutType: 'Strength',
        muscleGroups: [],
        workoutDurationMinutes: 45,
        exercises: [{ id: 'ex-1', name: text, sets: 3, reps: 10 }],
        notes: text,
        planId: planId || undefined,
        planContribution: planId ? (planContribution ?? 1) : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (selectedCat === 'learning') {
      addOrUpdateLearningEntry(captureDate, {
        id: `learn-${Date.now()}`,
        date: captureDate,
        subject: 'General Study',
        technologyOrConcept: text,
        learningSource: 'Self Study',
        studyDurationMinutes: 30,
        notes: text,
        planId: planId || undefined,
        planContribution: planId ? (planContribution ?? 1) : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (selectedCat === 'project') {
      addOrUpdateProjectEntry(captureDate, {
        id: `proj-${Date.now()}`,
        date: captureDate,
        projectName: text.length > 25 ? text.substring(0, 25) + '...' : text,
        objective: text,
        tasksCompleted: [text],
        progressPercentage: 50,
        repositoryLinks: [],
        planId: planId || undefined,
        planContribution: planId ? (planContribution ?? 1) : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (selectedCat === 'personal') {
      addOrUpdatePersonalEntry(captureDate, {
        id: `pers-${Date.now()}`,
        date: captureDate,
        title: text.length > 35 ? text.substring(0, 35) + '...' : text,
        type: 'experience',
        description: text,
        planId: planId || undefined,
        planContribution: planId ? (planContribution ?? 1) : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (selectedCat === 'health') {
      const rec = getOrCreateDailyRecord(captureDate);
      updateHealthEntry(captureDate, {
        id: rec.health?.id || `health-${Date.now()}`,
        date: captureDate,
        sleepHours: rec.health?.sleepHours || 7.5,
        waterIntakeLiters: rec.health?.waterIntakeLiters || 2.5,
        habits: rec.health?.habits || [],
        notes: text,
        createdAt: rec.health?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    }

    // Also update daily summary if not set
    const rec = getOrCreateDailyRecord(captureDate);
    if (!rec.summary && text.length > 5) {
      saveDailyRecord({
        ...rec,
        summary: text.length > 60 ? text.substring(0, 60) + '...' : text,
      });
    }

    // Update reflection notes
    const existingRefl = rec.reflection || {
      id: `refl-${Date.now()}`,
      date: captureDate,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    updateDailyReflection(captureDate, {
      ...existingRefl,
      freeformNotes: existingRefl.freeformNotes
        ? `${existingRefl.freeformNotes}\n• ${text}`
        : text,
    });

    if (logAnother) {
      setSavedCount((c) => c + 1);
      setNoteText('');
    } else {
      setNoteText('');
      closeQuickCapture();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-white border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close (Concept Panel 6) */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
            Quick Capture
          </h2>
          <button
            onClick={closeQuickCapture}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:bg-[#161B22] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2x3 Categories Grid (Concept Panel 6) */}
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#181D25] border-[#FF7138] text-[#FF7138] ring-1 ring-[#FF7138]/50 shadow-md light:bg-[#FCE9E0] light:border-[#E95D2B] light:text-[#191B20]'
                    : 'bg-[#13161A] dark:bg-[#13161A] light:bg-neutral-100 border-[#1E232B] dark:border-[#1E232B] light:border-neutral-300 text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-black hover:border-neutral-600'
                }`}
              >
                <div className={isSelected ? 'text-[#FF7138]' : 'text-neutral-400'}>
                  {cat.icon}
                </div>
                <span className="text-xs font-sans font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Plan Link Selector for trackable categories */}
        {selectedCat !== 'health' && (
          <PlanLinkSelector
            category={selectedCat as PlanCategory}
            planId={planId}
            contribution={planContribution}
            onChange={(pId?: string, contrib?: number) => {
              setPlanId(pId);
              setPlanContribution(contrib);
            }}
          />
        )}

        {/* Note Textarea Input (Concept Panel 6) */}
        <div className="space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="Add a note (optional)..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-[#13161A] dark:bg-[#13161A] light:bg-neutral-100 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-300 text-white dark:text-white light:text-neutral-900 placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#FF7138] focus:ring-1 focus:ring-[#FF7138] resize-none transition-all"
            autoFocus
          />

          {/* Date Selector Toggle & Shortcuts */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 hover:text-[#FF7138] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Target: {captureDate}</span>
            </button>
            <span>⌘ + Enter to save</span>
          </div>

          {showDatePicker && (
            <div className="pt-2">
              <input
                type="date"
                value={captureDate}
                onChange={(e) => setCaptureDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#242A35] light:border-[#D7D5CE] bg-[#14181F] light:bg-[#FFFFFF] text-xs font-mono text-white light:text-[#191B20] focus:outline-none focus:border-[#FF7138]"
              />
            </div>
          )}
        </div>

        {/* Batch Logging: "Log another" Toggle & Feedback */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-400 select-none">
            <input
              type="checkbox"
              checked={logAnother}
              onChange={(e) => setLogAnother(e.target.checked)}
              className="accent-[#FF7138] rounded cursor-pointer"
            />
            <span>Log another (Batch capture)</span>
          </label>

          {savedCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <Check className="w-3 h-3" />
              <span>{savedCount} logged</span>
            </span>
          )}
        </div>

        {/* Big Signal Orange Button: Save Entry → (Concept Panel 6) */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#FF7138] hover:bg-[#FF8352] text-white text-sm font-medium tracking-wide shadow-orange-sm hover:shadow-orange-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <span>{logAnother ? 'Save & Log Another' : 'Save Entry'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
