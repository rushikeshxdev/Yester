import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ActivityCategory } from '../../types';
import {
  addOrUpdateWorkEntry,
  addOrUpdateFitnessEntry,
  addOrUpdateLearningEntry,
  addOrUpdateProjectEntry,
  addOrUpdatePersonalEntry,
  updateHealthEntry,
  updateDailyReflection,
  getOrCreateDailyRecord,
} from '../../services/storage';

interface DailyEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  category: ActivityCategory | 'reflection';
  existingEntry?: any;
}

export const DailyEntryModal: React.FC<DailyEntryModalProps> = ({
  isOpen,
  onClose,
  dateKey,
  category,
  existingEntry,
}) => {
  // WORK form states
  const [workOrg, setWorkOrg] = useState('');
  const [workProject, setWorkProject] = useState('');
  const [workRole, setWorkRole] = useState('');
  const [workTasks, setWorkTasks] = useState('');
  const [workProblems, setWorkProblems] = useState('');
  const [workRootCauses, setWorkRootCauses] = useState('');
  const [workApproach, setWorkApproach] = useState('');
  const [workSolution, setWorkSolution] = useState('');
  const [workTechDecisions, setWorkTechDecisions] = useState('');
  const [workTechnologies, setWorkTechnologies] = useState('');
  const [workOutcome, setWorkOutcome] = useState('');
  const [workLearned, setWorkLearned] = useState('');
  const [workReflections, setWorkReflections] = useState('');
  const [workEvidenceLabel, setWorkEvidenceLabel] = useState('');
  const [workEvidenceUrl, setWorkEvidenceUrl] = useState('');
  const [workEvidenceLinks, setWorkEvidenceLinks] = useState<Array<{ id: string; label: string; url: string }>>([]);

  // FITNESS form states
  const [fitType, setFitType] = useState<'Strength' | 'Cardio' | 'HIIT' | 'Mobility' | 'Sports' | 'Recovery'>('Strength');
  const [fitDuration, setFitDuration] = useState('60');
  const [fitBodyweight, setFitBodyweight] = useState('');
  const [fitMuscles, setFitMuscles] = useState('');
  const [fitPRs, setFitPRs] = useState('');
  const [fitNotes, setFitNotes] = useState('');
  const [fitExercises, setFitExercises] = useState<Array<{ id: string; name: string; sets: number; reps: number; weightKg?: number }>>([]);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState('');
  const [fitCardioType, setFitCardioType] = useState('');
  const [fitCardioDuration, setFitCardioDuration] = useState('');
  const [fitCardioDistance, setFitCardioDistance] = useState('');

  // LEARNING form states
  const [learnSubject, setLearnSubject] = useState('');
  const [learnTechConcept, setLearnTechConcept] = useState('');
  const [learnSource, setLearnSource] = useState('');
  const [learnDuration, setLearnDuration] = useState('45');
  const [learnUnderstood, setLearnUnderstood] = useState('');
  const [learnToImprove, setLearnToImprove] = useState('');
  const [learnProblems, setLearnProblems] = useState('');
  const [learnPractical, setLearnPractical] = useState('');
  const [learnNotes, setLearnNotes] = useState('');

  // PROJECT form states
  const [projName, setProjName] = useState('');
  const [projObjective, setProjObjective] = useState('');
  const [projProgress, setProjProgress] = useState('50');
  const [projTasks, setProjTasks] = useState('');
  const [projTechImpl, setProjTechImpl] = useState('');
  const [projDecisions, setProjDecisions] = useState('');
  const [projBlockers, setProjBlockers] = useState('');
  const [projNextSteps, setProjNextSteps] = useState('');
  const [projRepoUrl, setProjRepoUrl] = useState('');
  const [projNotes, setProjNotes] = useState('');

  // PERSONAL form states
  const [persTitle, setPersTitle] = useState('');
  const [persType, setPersType] = useState<'family' | 'friends' | 'experience' | 'milestone' | 'memory' | 'general'>('experience');
  const [persPeople, setPersPeople] = useState('');
  const [persDesc, setPersDesc] = useState('');
  const [persSignificance, setPersSignificance] = useState('');
  const [persLocation, setPersLocation] = useState('');

  // HEALTH form states
  const [healthSleep, setHealthSleep] = useState('7.5');
  const [healthSleepQuality, setHealthSleepQuality] = useState<'restful' | 'average' | 'disrupted'>('restful');
  const [healthWater, setHealthWater] = useState('2.5');
  const [healthHabits, setHealthHabits] = useState<Array<{ id: string; name: string; completed: boolean }>>([
    { id: 'h-1', name: 'No screens 60m before bed', completed: true },
    { id: 'h-2', name: 'Cold morning exposure / shower', completed: false },
    { id: 'h-3', name: 'Mindfulness & Journaling', completed: true },
    { id: 'h-4', name: 'Deep Reading 30m', completed: true },
  ]);
  const [newHabitName, setNewHabitName] = useState('');

  // REFLECTION form states
  const [reflWentWell, setReflWentWell] = useState('');
  const [reflWentWrong, setReflWentWrong] = useState('');
  const [reflLearned, setReflLearned] = useState('');
  const [reflShouldImprove, setReflShouldImprove] = useState('');
  const [reflPriorities, setReflPriorities] = useState('');
  const [reflFreeform, setReflFreeform] = useState('');

  // Populate existing entry if editing
  useEffect(() => {
    if (existingEntry) {
      if (category === 'work') {
        setWorkOrg(existingEntry.organization || '');
        setWorkProject(existingEntry.project || '');
        setWorkRole(existingEntry.role || '');
        setWorkTasks(existingEntry.tasksPerformed?.join('\n') || '');
        setWorkProblems(existingEntry.problemsIdentified || '');
        setWorkRootCauses(existingEntry.rootCauses || '');
        setWorkApproach(existingEntry.approachTaken || '');
        setWorkSolution(existingEntry.solutionImplemented || '');
        setWorkTechDecisions(existingEntry.technicalDecisions || '');
        setWorkTechnologies(existingEntry.technologiesUsed?.join(', ') || '');
        setWorkOutcome(existingEntry.outcomeImpact || '');
        setWorkLearned(existingEntry.whatILearned || '');
        setWorkReflections(existingEntry.reflections || '');
        setWorkEvidenceLinks(existingEntry.evidenceLinks || []);
      } else if (category === 'fitness') {
        setFitType(existingEntry.workoutType || 'Strength');
        setFitDuration(String(existingEntry.workoutDurationMinutes || '60'));
        setFitBodyweight(existingEntry.bodyweightKg ? String(existingEntry.bodyweightKg) : '');
        setFitMuscles(existingEntry.muscleGroups?.join(', ') || '');
        setFitPRs(existingEntry.personalRecords?.join(', ') || '');
        setFitNotes(existingEntry.notes || '');
        setFitExercises(existingEntry.exercises || []);
        if (existingEntry.cardio) {
          setFitCardioType(existingEntry.cardio.type || '');
          setFitCardioDuration(existingEntry.cardio.durationMinutes ? String(existingEntry.cardio.durationMinutes) : '');
          setFitCardioDistance(existingEntry.cardio.distanceKm ? String(existingEntry.cardio.distanceKm) : '');
        }
      } else if (category === 'learning') {
        setLearnSubject(existingEntry.subject || '');
        setLearnTechConcept(existingEntry.technologyOrConcept || '');
        setLearnSource(existingEntry.learningSource || '');
        setLearnDuration(String(existingEntry.studyDurationMinutes || '45'));
        setLearnUnderstood(existingEntry.whatIUnderstood || '');
        setLearnToImprove(existingEntry.whatToImprove || '');
        setLearnProblems(existingEntry.problemsSolved?.join('\n') || '');
        setLearnPractical(existingEntry.practicalImplementation || '');
        setLearnNotes(existingEntry.notes || '');
      } else if (category === 'project') {
        setProjName(existingEntry.projectName || '');
        setProjObjective(existingEntry.objective || '');
        setProjProgress(String(existingEntry.progressPercentage || 50));
        setProjTasks(existingEntry.tasksCompleted?.join('\n') || '');
        setProjTechImpl(existingEntry.technicalImplementation || '');
        setProjDecisions(existingEntry.decisions || '');
        setProjBlockers(existingEntry.blockers || '');
        setProjNextSteps(existingEntry.nextSteps || '');
        setProjNotes(existingEntry.notes || '');
      } else if (category === 'personal') {
        setPersTitle(existingEntry.title || '');
        setPersType(existingEntry.type || 'experience');
        setPersPeople(existingEntry.peopleInvolved?.join(', ') || '');
        setPersDesc(existingEntry.description || '');
        setPersSignificance(existingEntry.significance || '');
        setPersLocation(existingEntry.location || '');
      } else if (category === 'health') {
        setHealthSleep(String(existingEntry.sleepHours || 8));
        setHealthSleepQuality(existingEntry.sleepQuality || 'restful');
        setHealthWater(String(existingEntry.waterIntakeLiters || 2.5));
        if (existingEntry.habits) setHealthHabits(existingEntry.habits);
      } else if (category === 'reflection') {
        setReflWentWell(existingEntry.wentWell || '');
        setReflWentWrong(existingEntry.wentWrong || '');
        setReflLearned(existingEntry.learned || '');
        setReflShouldImprove(existingEntry.shouldImprove || '');
        setReflPriorities(existingEntry.prioritiesTomorrow?.join('\n') || '');
        setReflFreeform(existingEntry.freeformNotes || '');
      }
    } else {
      // If reflection or health has existing entry in this date's record, load it
      const currentRec = getOrCreateDailyRecord(dateKey);
      if (category === 'health' && currentRec.health) {
        setHealthSleep(String(currentRec.health.sleepHours || 8));
        setHealthSleepQuality(currentRec.health.sleepQuality || 'restful');
        setHealthWater(String(currentRec.health.waterIntakeLiters || 2.5));
        if (currentRec.health.habits) setHealthHabits(currentRec.health.habits);
      } else if (category === 'reflection' && currentRec.reflection) {
        setReflWentWell(currentRec.reflection.wentWell || '');
        setReflWentWrong(currentRec.reflection.wentWrong || '');
        setReflLearned(currentRec.reflection.learned || '');
        setReflShouldImprove(currentRec.reflection.shouldImprove || '');
        setReflPriorities(currentRec.reflection.prioritiesTomorrow?.join('\n') || '');
        setReflFreeform(currentRec.reflection.freeformNotes || '');
      }
    }
  }, [existingEntry, category, dateKey]);

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    setFitExercises((prev) => [
      ...prev,
      {
        id: `ex-${Date.now()}`,
        name: newExName.trim(),
        sets: Number(newExSets) || 3,
        reps: Number(newExReps) || 10,
        weightKg: newExWeight ? Number(newExWeight) : undefined,
      },
    ]);
    setNewExName('');
    setNewExWeight('');
  };

  const handleAddEvidenceLink = () => {
    if (!workEvidenceUrl.trim()) return;
    setWorkEvidenceLinks((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        label: workEvidenceLabel.trim() || 'Reference Link',
        url: workEvidenceUrl.trim(),
      },
    ]);
    setWorkEvidenceLabel('');
    setWorkEvidenceUrl('');
  };

  const handleSave = () => {
    const timestamp = new Date().toISOString();
    const entryId = existingEntry?.id || `${category}-${Date.now()}`;

    if (category === 'work') {
      const tasks = workTasks
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);
      const techs = workTechnologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      addOrUpdateWorkEntry(dateKey, {
        id: entryId,
        date: dateKey,
        organization: workOrg.trim() || 'Independent Engineering',
        project: workProject.trim() || 'Core Architecture',
        role: workRole.trim() || undefined,
        tasksPerformed: tasks.length ? tasks : ['System development & architectural implementation'],
        problemsIdentified: workProblems.trim() || undefined,
        rootCauses: workRootCauses.trim() || undefined,
        approachTaken: workApproach.trim() || undefined,
        solutionImplemented: workSolution.trim() || undefined,
        technicalDecisions: workTechDecisions.trim() || undefined,
        technologiesUsed: techs,
        outcomeImpact: workOutcome.trim() || undefined,
        evidenceLinks: workEvidenceLinks,
        whatILearned: workLearned.trim() || undefined,
        reflections: workReflections.trim() || undefined,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    } else if (category === 'fitness') {
      const muscles = fitMuscles
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      const prs = fitPRs
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      addOrUpdateFitnessEntry(dateKey, {
        id: entryId,
        date: dateKey,
        workoutType: fitType,
        muscleGroups: muscles,
        exercises: fitExercises,
        cardio: fitCardioType
          ? {
              type: fitCardioType,
              durationMinutes: Number(fitCardioDuration) || 20,
              distanceKm: fitCardioDistance ? Number(fitCardioDistance) : undefined,
            }
          : undefined,
        workoutDurationMinutes: Number(fitDuration) || 60,
        bodyweightKg: fitBodyweight ? Number(fitBodyweight) : undefined,
        personalRecords: prs,
        notes: fitNotes.trim() || undefined,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    } else if (category === 'learning') {
      const problems = learnProblems
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      addOrUpdateLearningEntry(dateKey, {
        id: entryId,
        date: dateKey,
        subject: learnSubject.trim() || 'Computer Science & Engineering',
        technologyOrConcept: learnTechConcept.trim() || 'Core Principles',
        learningSource: learnSource.trim() || 'Technical Literature',
        studyDurationMinutes: Number(learnDuration) || 45,
        problemsSolved: problems,
        whatIUnderstood: learnUnderstood.trim() || undefined,
        whatToImprove: learnToImprove.trim() || undefined,
        practicalImplementation: learnPractical.trim() || undefined,
        notes: learnNotes.trim() || undefined,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    } else if (category === 'project') {
      const tasks = projTasks
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      addOrUpdateProjectEntry(dateKey, {
        id: entryId,
        date: dateKey,
        projectName: projName.trim() || 'New Initiative',
        objective: projObjective.trim() || 'Core product milestone',
        tasksCompleted: tasks,
        progressPercentage: Number(projProgress) || 50,
        technicalImplementation: projTechImpl.trim() || undefined,
        decisions: projDecisions.trim() || undefined,
        blockers: projBlockers.trim() || undefined,
        nextSteps: projNextSteps.trim() || undefined,
        repositoryLinks: projRepoUrl
          ? [{ id: 'repo-link', label: 'Repository', url: projRepoUrl }]
          : [],
        notes: projNotes.trim() || undefined,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    } else if (category === 'personal') {
      const people = persPeople
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      addOrUpdatePersonalEntry(dateKey, {
        id: entryId,
        date: dateKey,
        title: persTitle.trim() || 'Personal Milestone',
        type: persType,
        peopleInvolved: people,
        description: persDesc.trim() || 'Personal life experience and memory recorded.',
        significance: persSignificance.trim() || undefined,
        location: persLocation.trim() || undefined,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    } else if (category === 'health') {
      updateHealthEntry(dateKey, {
        id: entryId,
        date: dateKey,
        sleepHours: Number(healthSleep) || 8,
        sleepQuality: healthSleepQuality,
        waterIntakeLiters: Number(healthWater) || 2.5,
        habits: healthHabits,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    } else if (category === 'reflection') {
      const priorities = reflPriorities
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean);

      updateDailyReflection(dateKey, {
        id: entryId,
        date: dateKey,
        wentWell: reflWentWell.trim() || undefined,
        wentWrong: reflWentWrong.trim() || undefined,
        learned: reflLearned.trim() || undefined,
        shouldImprove: reflShouldImprove.trim() || undefined,
        prioritiesTomorrow: priorities,
        freeformNotes: reflFreeform.trim() || undefined,
        createdAt: existingEntry?.createdAt || timestamp,
        updatedAt: timestamp,
      });
    }

    onClose();
  };

  const getTitle = () => {
    switch (category) {
      case 'work':
        return existingEntry ? 'Edit Work & Professional Record' : 'Log Work & Professional Activity';
      case 'fitness':
        return existingEntry ? 'Edit Physical & Fitness Record' : 'Log Physical & Fitness Session';
      case 'learning':
        return existingEntry ? 'Edit Learning & Education Record' : 'Log Learning & Education Session';
      case 'project':
        return existingEntry ? 'Edit Personal Project Record' : 'Log Project Milestone';
      case 'personal':
        return existingEntry ? 'Edit Personal Life Event' : 'Log Personal Milestone / Experience';
      case 'health':
        return 'Update Daily Health & Habits';
      case 'reflection':
        return 'Daily Evening Reflection';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      subtitle={`Recorded on ${dateKey}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        {/* WORK SECTION FORM */}
        {category === 'work' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  value={workOrg}
                  onChange={(e) => setWorkOrg(e.target.value)}
                  placeholder="e.g. Acme Corp / Client / Studio"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Project *
                </label>
                <input
                  type="text"
                  value={workProject}
                  onChange={(e) => setWorkProject(e.target.value)}
                  placeholder="e.g. Distributed Engine v2"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Role or Responsibility
              </label>
              <input
                type="text"
                value={workRole}
                onChange={(e) => setWorkRole(e.target.value)}
                placeholder="e.g. Lead Systems Architect"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Tasks Performed (one per line)
              </label>
              <textarea
                rows={3}
                value={workTasks}
                onChange={(e) => setWorkTasks(e.target.value)}
                placeholder="• Profiled memory allocations in network socket layer&#10;• Refactored lock contention in thread pool"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Problem Identified
                </label>
                <textarea
                  rows={2}
                  value={workProblems}
                  onChange={(e) => setWorkProblems(e.target.value)}
                  placeholder="Latency spikes during rolling pod restart"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Root Cause
                </label>
                <textarea
                  rows={2}
                  value={workRootCauses}
                  onChange={(e) => setWorkRootCauses(e.target.value)}
                  placeholder="Partition revocation without epoch barrier"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Approach Taken & Solution
                </label>
                <textarea
                  rows={2}
                  value={workSolution}
                  onChange={(e) => setWorkSolution(e.target.value)}
                  placeholder="Implemented two-phase cooperative rebalance"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Technical Decisions
                </label>
                <textarea
                  rows={2}
                  value={workTechDecisions}
                  onChange={(e) => setWorkTechDecisions(e.target.value)}
                  placeholder="Chose embedded ringbuffer over unbounded queue"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Technologies Used (comma separated)
                </label>
                <input
                  type="text"
                  value={workTechnologies}
                  onChange={(e) => setWorkTechnologies(e.target.value)}
                  placeholder="Rust, Tokio, eBPF, Kafka, Prometheus"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Actual Outcome & Measurable Impact
                </label>
                <input
                  type="text"
                  value={workOutcome}
                  onChange={(e) => setWorkOutcome(e.target.value)}
                  placeholder="P99 dropped from 480ms to 42ms"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            {/* Evidence Links */}
            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Evidence Links (GitHub PRs, Commits, ADRs)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Label (e.g. PR #142)"
                  value={workEvidenceLabel}
                  onChange={(e) => setWorkEvidenceLabel(e.target.value)}
                  className="w-1/3 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="url"
                  placeholder="URL (https://...)"
                  value={workEvidenceUrl}
                  onChange={(e) => setWorkEvidenceUrl(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <Button size="sm" variant="secondary" onClick={handleAddEvidenceLink}>
                  Add
                </Button>
              </div>

              {workEvidenceLinks.length > 0 && (
                <div className="space-y-1">
                  {workEvidenceLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between px-2.5 py-1 rounded bg-neutral-100 dark:bg-[#1E1E1E] text-[11px]"
                    >
                      <span className="font-semibold">{link.label}</span>
                      <span className="text-neutral-400 truncate max-w-xs">{link.url}</span>
                      <button
                        onClick={() =>
                          setWorkEvidenceLinks((prev) => prev.filter((l) => l.id !== link.id))
                        }
                        className="text-neutral-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What I Learned
                </label>
                <textarea
                  rows={2}
                  value={workLearned}
                  onChange={(e) => setWorkLearned(e.target.value)}
                  placeholder="Key engineering principle extracted"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Personal Reflections
                </label>
                <textarea
                  rows={2}
                  value={workReflections}
                  onChange={(e) => setWorkReflections(e.target.value)}
                  placeholder="Thoughts on collaboration or pacing"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* FITNESS SECTION FORM */}
        {category === 'fitness' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Workout Type
                </label>
                <select
                  value={fitType}
                  onChange={(e) => setFitType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Mobility">Mobility</option>
                  <option value="Sports">Sports</option>
                  <option value="Recovery">Recovery</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={fitDuration}
                  onChange={(e) => setFitDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Bodyweight (Kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fitBodyweight}
                  onChange={(e) => setFitBodyweight(e.target.value)}
                  placeholder="e.g. 81.5"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Target Muscle Groups (comma separated)
              </label>
              <input
                type="text"
                value={fitMuscles}
                onChange={(e) => setFitMuscles(e.target.value)}
                placeholder="Chest, Shoulders, Triceps"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Exercises table input */}
            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Exercises & Working Sets
              </label>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="col-span-5 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={newExSets}
                  onChange={(e) => setNewExSets(e.target.value)}
                  className="col-span-2 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                  className="col-span-2 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Kg"
                  value={newExWeight}
                  onChange={(e) => setNewExWeight(e.target.value)}
                  className="col-span-2 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="col-span-1 p-1.5 bg-neutral-200 dark:bg-[#252525] hover:bg-neutral-300 dark:hover:bg-[#303030] rounded flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {fitExercises.length > 0 && (
                <div className="space-y-1">
                  {fitExercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded bg-neutral-100 dark:bg-[#1E1E1E] text-xs"
                    >
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {ex.name}
                      </span>
                      <span className="text-neutral-500">
                        {ex.sets} sets &times; {ex.reps} reps {ex.weightKg ? `@ ${ex.weightKg}kg` : ''}
                      </span>
                      <button
                        onClick={() =>
                          setFitExercises((prev) => prev.filter((e) => e.id !== ex.id))
                        }
                        className="text-neutral-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cardio & Personal Records */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Cardio Type & Distance
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Zone 2 Trail Run"
                    value={fitCardioType}
                    onChange={(e) => setFitCardioType(e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Km"
                    value={fitCardioDistance}
                    onChange={(e) => setFitCardioDistance(e.target.value)}
                    className="w-20 px-2 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Personal Records (PRs)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bench 105kg x 6"
                  value={fitPRs}
                  onChange={(e) => setFitPRs(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Recovery & Fitness Notes
              </label>
              <textarea
                rows={2}
                value={fitNotes}
                onChange={(e) => setFitNotes(e.target.value)}
                placeholder="High energy throughout, shoulder felt robust"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* LEARNING SECTION FORM */}
        {category === 'learning' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={learnSubject}
                  onChange={(e) => setLearnSubject(e.target.value)}
                  placeholder="e.g. Distributed Systems / Machine Learning"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Technology or Concept *
                </label>
                <input
                  type="text"
                  value={learnTechConcept}
                  onChange={(e) => setLearnTechConcept(e.target.value)}
                  placeholder="e.g. Raft Consensus Joint Membership"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Learning Source
                </label>
                <input
                  type="text"
                  value={learnSource}
                  onChange={(e) => setLearnSource(e.target.value)}
                  placeholder="e.g. Stanford Dissertation / RFC 7540"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Study Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={learnDuration}
                  onChange={(e) => setLearnDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What I Understood
                </label>
                <textarea
                  rows={2}
                  value={learnUnderstood}
                  onChange={(e) => setLearnUnderstood(e.target.value)}
                  placeholder="Core mental model synthesized"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What I Still Need to Improve
                </label>
                <textarea
                  rows={2}
                  value={learnToImprove}
                  onChange={(e) => setLearnToImprove(e.target.value)}
                  placeholder="Unresolved questions or edge cases"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Problems Solved (one per line)
              </label>
              <textarea
                rows={2}
                value={learnProblems}
                onChange={(e) => setLearnProblems(e.target.value)}
                placeholder="• Solved LeetCode 295: Find Median from Data Stream&#10;• Proved safety invariant in network split"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Practical Implementation & Notes
              </label>
              <textarea
                rows={2}
                value={learnPractical}
                onChange={(e) => setLearnPractical(e.target.value)}
                placeholder="Coded small test harness in Go to observe leader election"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* PROJECT SECTION FORM */}
        {category === 'project' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. LIFE OS / Async Reactor"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Progress Percentage ({projProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projProgress}
                  onChange={(e) => setProjProgress(e.target.value)}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Objective
              </label>
              <input
                type="text"
                value={projObjective}
                onChange={(e) => setProjObjective(e.target.value)}
                placeholder="Core milestone goal"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Tasks Completed (one per line)
              </label>
              <textarea
                rows={3}
                value={projTasks}
                onChange={(e) => setProjTasks(e.target.value)}
                placeholder="• Designed data persistence layer&#10;• Created Swiss-inspired UI tokens"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Technical Decisions
                </label>
                <textarea
                  rows={2}
                  value={projDecisions}
                  onChange={(e) => setProjDecisions(e.target.value)}
                  placeholder="Monochrome black-and-white theme"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Blockers or Roadblocks
                </label>
                <textarea
                  rows={2}
                  value={projBlockers}
                  onChange={(e) => setProjBlockers(e.target.value)}
                  placeholder="None currently"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Next Steps
                </label>
                <input
                  type="text"
                  value={projNextSteps}
                  onChange={(e) => setProjNextSteps(e.target.value)}
                  placeholder="Integrate deep analytics charts"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Repository / Reference URL
                </label>
                <input
                  type="url"
                  value={projRepoUrl}
                  onChange={(e) => setProjRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL SECTION FORM */}
        {category === 'personal' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={persTitle}
                  onChange={(e) => setPersTitle(e.target.value)}
                  placeholder="e.g. Dinner with Marcus / Trail hike"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={persType}
                  onChange={(e) => setPersType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="experience">Experience</option>
                  <option value="milestone">Personal Milestone</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="memory">Significant Memory</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  People Involved (comma separated)
                </label>
                <input
                  type="text"
                  value={persPeople}
                  onChange={(e) => setPersPeople(e.target.value)}
                  placeholder="Marcus, Sarah"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={persLocation}
                  onChange={(e) => setPersLocation(e.target.value)}
                  placeholder="e.g. Old City Quarter"
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Description & Meaning
              </label>
              <textarea
                rows={3}
                value={persDesc}
                onChange={(e) => setPersDesc(e.target.value)}
                placeholder="Narrative description of what took place and the significance..."
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* HEALTH & HABITS FORM */}
        {category === 'health' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Sleep Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={healthSleep}
                  onChange={(e) => setHealthSleep(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Sleep Quality
                </label>
                <select
                  value={healthSleepQuality}
                  onChange={(e) => setHealthSleepQuality(e.target.value as any)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="restful">Restful & Deep</option>
                  <option value="average">Average</option>
                  <option value="disrupted">Disrupted</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  Water Intake (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={healthWater}
                  onChange={(e) => setHealthWater(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Daily Habits checklist */}
            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Daily Habits Checklist
              </label>
              <div className="space-y-1.5 mb-2">
                {healthHabits.map((habit) => (
                  <label
                    key={habit.id}
                    className="flex items-center gap-2.5 p-2 rounded bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#262626] cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500"
                  >
                    <input
                      type="checkbox"
                      checked={habit.completed}
                      onChange={(e) =>
                        setHealthHabits((prev) =>
                          prev.map((h) =>
                            h.id === habit.id ? { ...h, completed: e.target.checked } : h
                          )
                        )
                      }
                      className="rounded border-neutral-400"
                    />
                    <span
                      className={`text-xs ${
                        habit.completed
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom habit..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (!newHabitName.trim()) return;
                    setHealthHabits((prev) => [
                      ...prev,
                      { id: `h-${Date.now()}`, name: newHabitName.trim(), completed: false },
                    ]);
                    setNewHabitName('');
                  }}
                >
                  Add Habit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* REFLECTION FORM */}
        {category === 'reflection' && (
          <div className="space-y-3.5 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What went well?
                </label>
                <textarea
                  rows={2}
                  value={reflWentWell}
                  onChange={(e) => setReflWentWell(e.target.value)}
                  placeholder="Wins, focused flow states, or disciplined choices..."
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What went wrong?
                </label>
                <textarea
                  rows={2}
                  value={reflWentWrong}
                  onChange={(e) => setReflWentWrong(e.target.value)}
                  placeholder="Distractions, friction points, or misjudgments..."
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What did I learn?
                </label>
                <textarea
                  rows={2}
                  value={reflLearned}
                  onChange={(e) => setReflLearned(e.target.value)}
                  placeholder="Key insight synthesized today..."
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                  What should I improve?
                </label>
                <textarea
                  rows={2}
                  value={reflShouldImprove}
                  onChange={(e) => setReflShouldImprove(e.target.value)}
                  placeholder="Concrete behavior to calibrate..."
                  className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Priorities for Tomorrow (one per line)
              </label>
              <textarea
                rows={2}
                value={reflPriorities}
                onChange={(e) => setReflPriorities(e.target.value)}
                placeholder="• Deploy canary rebalance build&#10;• Heavy deadlift session&#10;• Review consensus draft"
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-500 uppercase tracking-wider mb-1">
                Free-form Journal Writing
              </label>
              <textarea
                rows={3}
                value={reflFreeform}
                onChange={(e) => setReflFreeform(e.target.value)}
                placeholder="Unstructured thoughts, philosophical musings, long-term visions..."
                className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-[#2C2C2C] bg-transparent text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-[#242424]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Record
          </Button>
        </div>
      </div>
    </Modal>
  );
};
