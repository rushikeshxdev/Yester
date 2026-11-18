import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSummary(userId: string) {
    const [totalRecords, totalEntries, activePlans] = await Promise.all([
      this.prisma.dailyRecord.count({
        where: { userId, deletedAt: null },
      }),
      this.prisma.dailyEntry.count({
        where: { userId, deletedAt: null },
      }),
      this.prisma.lifePlan.count({
        where: { userId, status: 'ACTIVE', deletedAt: null },
      }),
    ]);

    return {
      userId,
      totalRecords,
      totalEntries,
      activePlans,
      generatedAt: new Date().toISOString(),
    };
  }
}
