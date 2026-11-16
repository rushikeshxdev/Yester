import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  FolderKanban,
  Heart,
  FileText,
  Calendar,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useLifeOS } from '../../context/LifeOSContext';
import {
  addOrUpdateWorkEntry,
  addOrUpdateFitnessEntry,
  addOrUpdateLearningEntry,
  addOrUpdateProjectEntry,
  addOrUpdatePersonalEntry,
  updateDailyReflection,
  getOrCreateDailyRecord,
} from '../../services/storage';

type QuickTab = 'work' | 'fitness' | 'learning' | 'project' | 'personal' | 'note';

export const QuickCaptureModal: React.FC = () => {
  const { quickCapture, closeQuickCapture } = useLifeOS();
  const [tab, setTab] = useState<QuickTab>(quickCapture.initialCategory as QuickTab || 'work');
  const [captureDate, setCaptureDate] = useState<string>(quickCapture.initialDate);

  // Work inputs
  const [workOrg, setWorkOrg] = useState('');
  const [workProject, setWorkProject] = useState('');
  const [workTask, setWorkTask] = useState('');
  const [workOutcome, setWorkOutcome] = useState('');

  // Fitness inputs
  const [fitType, setFitType] = useState<'Strength' | 'Cardio' | 'HIIT' | 'Mobility'>('Strength');
  const [fitDuration, setFitDuration] = useState('45');
  const [fitExercises, setFitExercises] = useState('');
  const [fitNotes, setFitNotes] = useState('');

  // Learning inputs
  const [learnSubject, setLearnSubject] = useState('');
  const [learnConcept, setLearnConcept] = useState('');
  const [learnMinutes, setLearnMinutes] = useState('30');
  const [learnNotes, setLearnNotes] = useState('');

  // Project inputs
  const [projName, setProjName] = useState('');
  const [projTask, setProjTask] = useState('');
  const [projProgress, setProjProgress] = useState('50');

  // Personal inputs
  const [persTitle, setPersTitle] = useState('');
  const [persNotes, setPersNotes] = useState('');

  // General note
  const [generalNote, setGeneralNote] = useState('');

  useEffect(() => {
    if (quickCapture.isOpen) {
      setTab(quickCapture.initialCategory as QuickTab || 'work');
      setCaptureDate(quickCapture.initialDate);
    }
  }, [quickCapture]);

  const handleSave = () => {
    const timestamp = new Date().toISOString();

    if (tab === 'work') {
      if (!workProject.trim() && !workTask.trim()) return;
      addOrUpdateWorkEntry(captureDate, {
        id: `work-${Date.now()}`,
        date: captureDate,
        organization: workOrg.trim() || 'Core Engineering',
        project: workProject.trim() || 'General Initiative',
        tasksPerformed: workTask.trim() ? [workTask.trim()] : ['Progress recorded'],
        outcomeImpact: workOutcome.trim() || undefined,
        technologiesUsed: [],
        evidenceLinks: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (tab === 'fitness') {
      const exercisesList = fitExercises
        .split('\n')
        .map((e) => e.trim())
        .filter(Boolean)
        .map((e, idx) => ({
          id: `ex-${idx}`,
          name: e,
          sets: 3,
          reps: 10,
        }));

      addOrUpdateFitnessEntry(captureDate, {
        id: `fit-${Date.now()}`,
        date: captureDate,
        workoutType: fitType,
        muscleGroups: [],
        workoutDurationMinutes: Number(fitDuration) || 45,
        exercises: exercisesList,
        notes: fitNotes.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (tab === 'learning') {
      if (!learnSubject.trim() && !learnConcept.trim()) return;
      addOrUpdateLearningEntry(captureDate, {
        id: `learn-${Date.now()}`,
        date: captureDate,
        subject: learnSubject.trim() || 'Computer Science',
        technologyOrConcept: learnConcept.trim() || 'Core Theory',
        learningSource: 'Self-Directed Reading',
        studyDurationMinutes: Number(learnMinutes) || 30,
        notes: learnNotes.trim() || undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (tab === 'project') {
      if (!projName.trim() && !projTask.trim()) return;
      addOrUpdateProjectEntry(captureDate, {
        id: `proj-${Date.now()}`,
        date: captureDate,
        projectName: projName.trim() || 'Active Initiative',
        objective: 'Progress update',
        tasksCompleted: projTask.trim() ? [projTask.trim()] : ['Milestone update'],
        progressPercentage: Number(projProgress) || 50,
        repositoryLinks: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (tab === 'personal') {
      if (!persTitle.trim() && !persNotes.trim()) return;
      addOrUpdatePersonalEntry(captureDate, {
        id: `pers-${Date.now()}`,
        date: captureDate,
        title: persTitle.trim() || 'Life Experience',
        type: 'experience',
        description: persNotes.trim() || 'Personal life moment recorded.',
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    } else if (tab === 'note') {
      if (!generalNote.trim()) return;
      const rec = getOrCreateDailyRecord(captureDate);
      const existingRefl = rec.reflection || {
        id: `refl-${Date.now()}`,
        date: captureDate,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      updateDailyReflection(captureDate, {
        ...existingRefl,
        freeformNotes: existingRefl.freeformNotes
          ? `${existingRefl.freeformNotes}\n\n• ${generalNote.trim()}`
          : generalNote.trim(),
      });
    }

    // Reset fields & close
    setWorkTask('');
    setWorkOutcome('');
    setFitNotes('');
    setFitExercises('');
    setLearnConcept('');
    setLearnNotes('');
    setProjTask('');
    setPersTitle('');
    setPersNotes('');
    setGeneralNote('');
    closeQuickCapture();
  };

  return (
    <Modal
      isOpen={quickCapture.isOpen}
      onClose={closeQuickCapture}
      title="Rapid Life Capture"
      subtitle="Instantly register growth, performance, or reflections"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Date Selector Row */}
        <div className="flex items-center justify-between p-2.5 rounded bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-2 text-neutral-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px] tracking-wider font-semibold">Target Date:</span>
          </div>
          <input
            type="date"
            value={captureDate}
            onChange={(e) => setCaptureDate(e.target.value)}
            className="px-2 py-1 rounded border border-neutral-300 dark:border-[#333333] bg-white dark:bg-[#111111] text-neutral-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-6 gap-1 p-1 rounded-md bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#222222]">
          <button
            onClick={() => setTab('work')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-colors flex flex-col items-center gap-1 ${tab === 'work'
                ? 'bg-white dark:bg-[#222222] text-black dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work</span>
          </button>

          <button
            onClick={() => setTab('fitness')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-colors flex flex-col items-center gap-1 ${tab === 'fitness'
                ? 'bg-white dark:bg-[#222222] text-black dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Fit</span>
          </button>

          <button
            onClick={() => setTab('learning')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-colors flex flex-col items-center gap-1 ${tab === 'learning'
                ? 'bg-white dark:bg-[#222222] text-black dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Learn</span>
          </button>

          <button
            onClick={() => setTab('project')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-colors flex flex-col items-center gap-1 ${tab === 'project'
                ? 'bg-white dark:bg-[#222222] text-black dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Project</span>
          </button>

          <button
            onClick={() => setTab('personal')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-colors flex flex-col items-center gap-1 ${tab === 'personal'
                ? 'bg-white dark:bg-[#222222] text-black dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Life</span>
          </button>

          <button
            onClick={() => setTab('note')}
            className={`py-1.5 rounded text-[11px] font-semibold transition-colors flex flex-col items-center gap-1 ${tab === 'note'
                ? 'bg-white dark:bg-[#222222] text-black dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Tab Forms */}
        <div className="space-y-3 pt-1">
          {tab === 'work' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Organization"
                  value={workOrg}
                  onChange={(e) => setWorkOrg(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Project name *"
                  value={workProject}
                  onChange={(e) => setWorkProject(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Core task or problem solved *"
                value={workTask}
                onChange={(e) => setWorkTask(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Measurable outcome (e.g. latency reduced 30%)"
                value={workOutcome}
                onChange={(e) => setWorkOutcome(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
            </>
          )}

          {tab === 'fitness' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={fitType}
                  onChange={(e) => setFitType(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Mobility">Mobility</option>
                </select>
                <input
                  type="number"
                  placeholder="Duration (mins)"
                  value={fitDuration}
                  onChange={(e) => setFitDuration(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Key exercises (one per line) or main lift"
                value={fitExercises}
                onChange={(e) => setFitExercises(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Workout notes or PRs"
                value={fitNotes}
                onChange={(e) => setFitNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
            </>
          )}

          {tab === 'learning' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Subject"
                  value={learnSubject}
                  onChange={(e) => setLearnSubject(e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Mins"
                  value={learnMinutes}
                  onChange={(e) => setLearnMinutes(e.target.value)}
                  className="col-span-1 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Concept or paper title *"
                value={learnConcept}
                onChange={(e) => setLearnConcept(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
              <textarea
                rows={2}
                placeholder="Key insight or principle learned"
                value={learnNotes}
                onChange={(e) => setLearnNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
            </>
          )}

          {tab === 'project' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Project name *"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="% done"
                  value={projProgress}
                  onChange={(e) => setProjProgress(e.target.value)}
                  className="col-span-1 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Milestone accomplished or code written"
                value={projTask}
                onChange={(e) => setProjTask(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
            </>
          )}

          {tab === 'personal' && (
            <>
              <input
                type="text"
                placeholder="Experience / event title *"
                value={persTitle}
                onChange={(e) => setPersTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
              <textarea
                rows={2}
                placeholder="Meaningful details or memory"
                value={persNotes}
                onChange={(e) => setPersNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
            </>
          )}

          {tab === 'note' && (
            <>
              <textarea
                rows={4}
                placeholder="Quick thought, reflection, or note to record for this day..."
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
              />
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-[#242424]">
          <Button variant="ghost" size="sm" onClick={closeQuickCapture}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save to {captureDate}
          </Button>
        </div>
      </div>
    </Modal>
  );
};