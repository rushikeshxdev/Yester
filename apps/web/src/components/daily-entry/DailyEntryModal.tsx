import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  FolderKanban,
  Heart,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ActivityCategory } from '../../types';
import {
  addOrUpdateWorkEntry,
  addOrUpdateFitnessEntry,
  addOrUpdateLearningEntry,
  addOrUpdateProjectEntry,
  addOrUpdatePersonalEntry,
  updateHealthEntry,
  updateDailyReflection,
} from '../../services/storage';

import { WorkForm } from './forms/WorkForm';
import { FitnessForm } from './forms/FitnessForm';
import { LearningForm } from './forms/LearningForm';
import { ProjectForm } from './forms/ProjectForm';
import { PersonalForm } from './forms/PersonalForm';
import { HealthForm } from './forms/HealthForm';
import { ReflectionForm } from './forms/ReflectionForm';

export interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  category: ActivityCategory | 'reflection';
  existingEntry?: any;
}

const CATEGORY_TABS: Array<{
  id: ActivityCategory | 'reflection';
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'work', label: 'Work', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'project', label: 'Projects', icon: <FolderKanban className="w-3.5 h-3.5" /> },
  { id: 'personal', label: 'Personal', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'health', label: 'Health', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'reflection', label: 'Reflection', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const DailyEntryModal: React.FC<DailyEntryModalProps> = ({
  isOpen,
  onClose,
  dateKey,
  category,
  existingEntry,
}) => {
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | 'reflection'>(category);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory(category);
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const isEditMode = !!existingEntry;

  const handleSaveWork = (entry: any) => {
    addOrUpdateWorkEntry(dateKey, entry);
    onClose();
  };

  const handleSaveFitness = (entry: any) => {
    addOrUpdateFitnessEntry(dateKey, entry);
    onClose();
  };

  const handleSaveLearning = (entry: any) => {
    addOrUpdateLearningEntry(dateKey, entry);
    onClose();
  };

  const handleSaveProject = (entry: any) => {
    addOrUpdateProjectEntry(dateKey, entry);
    onClose();
  };

  const handleSavePersonal = (entry: any) => {
    addOrUpdatePersonalEntry(dateKey, entry);
    onClose();
  };

  const handleSaveHealth = (entry: any) => {
    updateHealthEntry(dateKey, entry);
    onClose();
  };

  const handleSaveReflection = (entry: any) => {
    updateDailyReflection(dateKey, entry);
    onClose();
  };

  const modalTitle = isEditMode
    ? `Edit ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Entry`
    : `Log ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} · ${dateKey}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Category Tabs (disabled when editing a specific record to preserve integrity) */}
        {!isEditMode && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#FF7138] text-white font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-black hover:bg-[#14181F] light:hover:bg-[#EBE9E3]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Subform based on category */}
        {activeCategory === 'work' && (
          <WorkForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSaveWork}
            onCancel={onClose}
          />
        )}

        {activeCategory === 'fitness' && (
          <FitnessForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSaveFitness}
            onCancel={onClose}
          />
        )}

        {activeCategory === 'learning' && (
          <LearningForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSaveLearning}
            onCancel={onClose}
          />
        )}

        {activeCategory === 'project' && (
          <ProjectForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSaveProject}
            onCancel={onClose}
          />
        )}

        {activeCategory === 'personal' && (
          <PersonalForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSavePersonal}
            onCancel={onClose}
          />
        )}

        {activeCategory === 'health' && (
          <HealthForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSaveHealth}
            onCancel={onClose}
          />
        )}

        {activeCategory === 'reflection' && (
          <ReflectionForm
            existingEntry={existingEntry}
            dateKey={dateKey}
            onSave={handleSaveReflection}
            onCancel={onClose}
          />
        )}
      </div>
    </Modal>
  );
};
