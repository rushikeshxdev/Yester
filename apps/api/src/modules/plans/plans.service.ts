import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string, id: string) {
    const plan = await this.prisma.lifePlan.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        milestones: true,
        entries: {
          where: { deletedAt: null },
          select: {
            id: true,
            planContribution: true,
            createdAt: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    // Dynamically derive currentValue from active linked entry contributions (Rule #3)
    const currentValue = plan.entries.reduce(
      (sum: number, entry: { planContribution: number | null }) => {
        return sum + (entry.planContribution ?? 1);
      },
      0,
    );

    const progressPercent = plan.targetValue > 0
      ? Math.round((currentValue / plan.targetValue) * 1000) / 10
      : 0;

    // Dynamically evaluate milestones against derived progress (Rule #4)
    const evaluatedMilestones = plan.milestones.map((m: { targetPercent: number; [key: string]: unknown }) => ({
      ...m,
      isReached: progressPercent >= m.targetPercent,
    }));

    return {
      ...plan,
      currentValue,
      progressPercent,
      milestones: evaluatedMilestones,
    };
  }

  async findAll(userId: string) {
    const plans = await this.prisma.lifePlan.findMany({
      where: { userId, deletedAt: null },
      include: {
        entries: {
          where: { deletedAt: null },
          select: { planContribution: true },
        },
      },
    });

    return plans.map((plan: { targetValue: number; entries: Array<{ planContribution: number | null }>; [key: string]: unknown }) => {
      const currentValue = plan.entries.reduce(
        (sum: number, e: { planContribution: number | null }) => sum + (e.planContribution ?? 1),
        0,
      );
      const progressPercent = plan.targetValue > 0
        ? Math.round((currentValue / plan.targetValue) * 1000) / 10
        : 0;

      return {
        ...plan,
        currentValue,
        progressPercent,
      };
    });
  }
}
