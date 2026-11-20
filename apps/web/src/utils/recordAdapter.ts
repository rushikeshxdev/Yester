import { DailyRecordResponse, LifePlanResponse } from '../types/api';
import {
  DailyRecord,
  LifePlan,
  WorkEntry,
  FitnessEntry,
  LearningEntry,
  ProjectEntry,
  PersonalEntry,
  PlanCategory,
  PacingType,
  PlanStatus,
} from '../types';

/**
 * Maps a backend DailyRecordResponse (PostgreSQL envelope + entries)
 * to the frontend DailyRecord domain structure.
 */
export function mapDailyRecordResponseToDomain(res: DailyRecordResponse): DailyRecord {
  const work: WorkEntry[] = [];
  const fitness: FitnessEntry[] = [];
  const learning: LearningEntry[] = [];
  const projects: ProjectEntry[] = [];
  const personal: PersonalEntry[] = [];

  (res.entries || []).forEach((e) => {
    const payload = e.payload || {};
    const baseFields = {
      id: e.id,
      date: res.date,
      planId: e.planId || undefined,
      planContribution: e.planContribution ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };

    switch (e.category) {
      case 'WORK':
        work.push({
          ...payload,
          ...baseFields,
          organization: payload.organization || 'General',
          project: payload.project || e.title,
          tasksPerformed: payload.tasksPerformed || [e.title],
          evidenceLinks: payload.evidenceLinks || [],
          technologiesUsed: payload.technologiesUsed || [],
        });
        break;

      case 'FITNESS':
        fitness.push({
          ...payload,
          ...baseFields,
          workoutType: payload.workoutType || 'Strength',
          muscleGroups: payload.muscleGroups || [],
          exercises: payload.exercises || [],
          workoutDurationMinutes: payload.workoutDurationMinutes || 0,
        });
        break;

      case 'LEARNING':
        learning.push({
          ...payload,
          ...baseFields,
          subject: payload.subject || 'Learning',
          technologyOrConcept: payload.technologyOrConcept || e.title,
          learningSource: payload.learningSource || 'Self-directed',
          studyDurationMinutes: payload.studyDurationMinutes || 0,
        });
        break;

      case 'PROJECT':
        projects.push({
          ...payload,
          ...baseFields,
          projectName: payload.projectName || e.title,
          objective: payload.objective || e.title,
          tasksCompleted: payload.tasksCompleted || [e.title],
          repositoryLinks: payload.repositoryLinks || [],
        });
        break;

      case 'PERSONAL':
      default:
        personal.push({
          ...payload,
          ...baseFields,
          title: payload.title || e.title,
          type: payload.type || 'general',
          description: payload.description || e.title,
        });
        break;
    }
  });

  return {
    id: res.id,
    date: res.date,
    work,
    fitness,
    learning,
    projects,
    personal,
    health: (res.healthData as any) || undefined,
    reflection: (res.reflection as any) || undefined,
    summary: res.headline || undefined,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
  };
}

/**
 * Maps a backend LifePlanResponse to the frontend LifePlan domain structure.
 */
export function mapLifePlanResponseToDomain(res: LifePlanResponse): LifePlan {
  return {
    id: res.id,
    title: res.title,
    statement: res.statement || '',
    category: (res.category?.toLowerCase() || 'project') as PlanCategory,
    startDate: res.startDate,
    targetDate: res.targetDate,
    unitLabel: res.unitLabel || 'units',
    targetValue: res.targetValue,
    pacingType: (res.pacingType?.toLowerCase() || 'linear') as PacingType,
    status: (res.status?.toLowerCase() || 'active') as PlanStatus,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
    milestones: (res.milestones || []).map((m) => ({
      id: m.id,
      title: m.title,
      targetPercent: m.targetPercent,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
  };
}
