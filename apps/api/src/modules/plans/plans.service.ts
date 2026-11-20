import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PacingType, PlanStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { formatCalendarDate, parseCalendarDate } from '../../common/utils/date.util';
import { derivePlanTrajectory } from './trajectory.engine';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new life plan with initial milestones and client UUID support.
   */
  async create(userId: string, dto: CreatePlanDto) {
    if (dto.targetDate < dto.startDate) {
      throw new BadRequestException('targetDate cannot precede startDate');
    }

    const startDate = parseCalendarDate(dto.startDate);
    const targetDate = parseCalendarDate(dto.targetDate);

    if (dto.id) {
      const existing = await this.prisma.lifePlan.findUnique({
        where: { id: dto.id },
      });
      if (existing) {
        throw new ConflictException(`Plan with ID ${dto.id} already exists`);
      }
    }

    const milestonesData = (dto.milestones || []).map((m) => ({
      ...(m.id ? { id: m.id } : {}),
      title: m.title,
      targetPercent: m.targetPercent,
      targetValue: Math.round(((m.targetPercent / 100) * dto.targetValue) * 100) / 100,
      revision: 1,
    }));

    const plan = await this.prisma.lifePlan.create({
      data: {
        ...(dto.id ? { id: dto.id } : {}),
        userId,
        title: dto.title,
        statement: dto.statement ?? null,
        category: dto.category,
        targetValue: dto.targetValue,
        unitLabel: dto.unitLabel ?? 'units',
        startDate,
        targetDate,
        pacingType: dto.pacingType ?? PacingType.LINEAR,
        status: PlanStatus.ACTIVE,
        revision: 1,
        ...(dto.createdAt ? { createdAt: new Date(dto.createdAt) } : {}),
        milestones: {
          create: milestonesData,
        },
      },
      include: {
        milestones: true,
      },
    });

    return {
      ...plan,
      startDate: formatCalendarDate(plan.startDate),
      targetDate: formatCalendarDate(plan.targetDate),
    };
  }

  /**
   * Lists all active plans for the authenticated user with dynamically derived progress.
   */
  async findAll(userId: string) {
    const plans = await this.prisma.lifePlan.findMany({
      where: { userId, deletedAt: null },
      include: {
        milestones: true,
        entries: {
          where: { deletedAt: null },
          include: {
            dailyRecord: {
              select: { date: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => {
      const mappedEntries = plan.entries.map((e) => ({
        id: e.id,
        date: formatCalendarDate(e.dailyRecord.date),
        category: e.category,
        title: e.title,
        planContribution: e.planContribution,
      }));

      const trajectory = derivePlanTrajectory(
        {
          id: plan.id,
          targetValue: plan.targetValue,
          startDate: formatCalendarDate(plan.startDate),
          targetDate: formatCalendarDate(plan.targetDate),
          pacingType: plan.pacingType,
          milestones: plan.milestones,
        },
        mappedEntries,
      );

      return {
        id: plan.id,
        userId: plan.userId,
        title: plan.title,
        statement: plan.statement,
        category: plan.category,
        targetValue: plan.targetValue,
        unitLabel: plan.unitLabel,
        startDate: formatCalendarDate(plan.startDate),
        targetDate: formatCalendarDate(plan.targetDate),
        pacingType: plan.pacingType,
        status: plan.status,
        revision: plan.revision,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        currentValue: trajectory.actualValue,
        progressPercent: trajectory.actualPercent,
        expectedValue: trajectory.expectedValue,
        expectedPercent: trajectory.expectedPercent,
        variancePercent: trajectory.variancePercent,
        paceStatus: trajectory.paceStatus,
        isComplete: trajectory.isComplete,
      };
    });
  }

  /**
   * Fetches a detailed life plan with dynamic milestone evaluation, daily chart series, and linked entries.
   */
  async findById(userId: string, id: string, asOfDate?: string) {
    const plan = await this.prisma.lifePlan.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        milestones: {
          orderBy: { targetPercent: 'asc' },
        },
        entries: {
          where: { deletedAt: null },
          include: {
            dailyRecord: {
              select: { date: true },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    const mappedEntries = plan.entries.map((e) => ({
      id: e.id,
      date: formatCalendarDate(e.dailyRecord.date),
      category: e.category,
      title: e.title,
      planContribution: e.planContribution,
    }));

    const trajectory = derivePlanTrajectory(
      {
        id: plan.id,
        targetValue: plan.targetValue,
        startDate: formatCalendarDate(plan.startDate),
        targetDate: formatCalendarDate(plan.targetDate),
        pacingType: plan.pacingType,
        milestones: plan.milestones,
      },
      mappedEntries,
      asOfDate,
    );

    return {
      id: plan.id,
      userId: plan.userId,
      title: plan.title,
      statement: plan.statement,
      category: plan.category,
      targetValue: plan.targetValue,
      unitLabel: plan.unitLabel,
      startDate: formatCalendarDate(plan.startDate),
      targetDate: formatCalendarDate(plan.targetDate),
      pacingType: plan.pacingType,
      status: plan.status,
      revision: plan.revision,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      trajectory,
    };
  }

  /**
   * Atomic optimistic concurrency update for life plans.
   */
  async update(userId: string, id: string, dto: UpdatePlanDto) {
    if (dto.startDate && dto.targetDate && dto.targetDate < dto.startDate) {
      throw new BadRequestException('targetDate cannot precede startDate');
    }

    const updateData: any = {
      title: dto.title !== undefined ? dto.title : undefined,
      statement: dto.statement !== undefined ? dto.statement : undefined,
      targetValue: dto.targetValue !== undefined ? dto.targetValue : undefined,
      unitLabel: dto.unitLabel !== undefined ? dto.unitLabel : undefined,
      pacingType: dto.pacingType !== undefined ? dto.pacingType : undefined,
      status: dto.status !== undefined ? dto.status : undefined,
      revision: { increment: 1 },
    };

    if (dto.startDate) updateData.startDate = parseCalendarDate(dto.startDate);
    if (dto.targetDate) updateData.targetDate = parseCalendarDate(dto.targetDate);

    const updateResult = await this.prisma.lifePlan.updateMany({
      where: {
        id,
        userId,
        revision: dto.expectedRevision,
        deletedAt: null,
      },
      data: updateData,
    });

    if (updateResult.count === 0) {
      const current = await this.prisma.lifePlan.findFirst({
        where: { id, userId },
      });

      if (!current || current.deletedAt !== null) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      throw new ConflictException(
        `Conflict: Plan has been modified concurrently. Expected revision: ${dto.expectedRevision}, current revision: ${current.revision}.`,
      );
    }

    return this.findById(userId, id);
  }

  /**
   * Soft-deletes a life plan while strictly preserving linked journal entries.
   */
  async delete(userId: string, id: string, expectedRevision?: number) {
    const whereClause: any = {
      id,
      userId,
      deletedAt: null,
    };

    if (expectedRevision !== undefined && expectedRevision !== null) {
      whereClause.revision = expectedRevision;
    }

    const result = await this.prisma.lifePlan.updateMany({
      where: whereClause,
      data: {
        deletedAt: new Date(),
        revision: { increment: 1 },
      },
    });

    if (result.count === 0) {
      const current = await this.prisma.lifePlan.findFirst({
        where: { id, userId },
      });

      if (!current || current.deletedAt !== null) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }

      if (expectedRevision !== undefined && current.revision !== expectedRevision) {
        throw new ConflictException(
          `Conflict: Plan revision mismatch. Expected revision: ${expectedRevision}, current revision: ${current.revision}.`,
        );
      }

      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return {
      message: 'Plan soft-deleted successfully',
      id,
    };
  }
}
