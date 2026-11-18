import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string, id: string) {
    const entry = await this.prisma.dailyEntry.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!entry) {
      throw new NotFoundException(`Entry with ID ${id} not found`);
    }

    return entry;
  }

  async validateCrossEntityOwnership(userId: string, dailyRecordId: string, planId?: string) {
    // 1. Verify DailyRecord belongs to user
    const record = await this.prisma.dailyRecord.findUnique({
      where: { id: dailyRecordId },
    });

    if (!record || record.userId !== userId) {
      throw new BadRequestException('Target daily record does not belong to the authenticated user');
    }

    // 2. If planId provided, verify LifePlan belongs to user (Rule #5)
    if (planId) {
      const plan = await this.prisma.lifePlan.findUnique({
        where: { id: planId },
      });

      if (!plan || plan.userId !== userId) {
        throw new BadRequestException('Linked plan does not belong to the authenticated user');
      }
    }

    return true;
  }
}
