import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DailyRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDate(userId: string, dateString: string) {
    // Parse calendar date YYYY-MM-DD
    const date = new Date(dateString);

    const record = await this.prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      include: {
        entries: {
          where: { deletedAt: null },
        },
      },
    });

    if (!record || record.deletedAt) {
      throw new NotFoundException(`Daily record for ${dateString} not found`);
    }

    return record;
  }
}
