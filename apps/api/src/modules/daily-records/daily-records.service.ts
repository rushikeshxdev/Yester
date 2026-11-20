import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertDailyRecordDto } from './dto/upsert-daily-record.dto';
import { formatCalendarDate, parseCalendarDate } from '../../common/utils/date.util';

@Injectable()
export class DailyRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds a daily record for the authenticated user on a specific calendar date (YYYY-MM-DD).
   * Excludes soft-deleted records and soft-deleted entries.
   */
  async findByDate(userId: string, dateString: string) {
    const parsedDate = parseCalendarDate(dateString);

    const record = await this.prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: parsedDate,
        },
      },
      include: {
        entries: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!record || record.deletedAt !== null) {
      throw new NotFoundException(`Daily record for ${dateString} not found`);
    }

    return {
      ...record,
      date: formatCalendarDate(record.date),
    };
  }

  /**
   * Atomic Upsert with Optimistic Concurrency Control.
   * - If no record exists: creates new record with client-minted UUID (or server-generated) and revision: 1.
   * - If record exists: requires expectedRevision and runs a single-statement atomic updateMany.
   * - If updateMany returns count === 0: uses ownership-scoped lookup to disambiguate 404 vs 409.
   */
  async upsert(userId: string, dateString: string, dto: UpsertDailyRecordDto) {
    const parsedDate = parseCalendarDate(dateString);

    const existing = await this.prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: parsedDate,
        },
      },
    });

    // Case 1: Record does not exist -> Create new record
    if (!existing) {
      const record = await this.prisma.dailyRecord.create({
        data: {
          ...(dto.id ? { id: dto.id } : {}),
          userId,
          date: parsedDate,
          headline: dto.headline ?? null,
          healthData: dto.healthData ?? {},
          reflection: dto.reflection ?? {},
          revision: 1,
          ...(dto.createdAt ? { createdAt: new Date(dto.createdAt) } : {}),
        },
        include: {
          entries: {
            where: { deletedAt: null },
          },
        },
      });

      return {
        ...record,
        date: formatCalendarDate(record.date),
      };
    }

    // Case 2: Record was soft-deleted -> Re-activate with incremented revision
    if (existing.deletedAt !== null) {
      const record = await this.prisma.dailyRecord.update({
        where: { id: existing.id },
        data: {
          headline: dto.headline ?? null,
          healthData: dto.healthData ?? {},
          reflection: dto.reflection ?? {},
          deletedAt: null,
          revision: { increment: 1 },
        },
        include: {
          entries: {
            where: { deletedAt: null },
          },
        },
      });

      return {
        ...record,
        date: formatCalendarDate(record.date),
      };
    }

    // Case 3: Record exists and is active -> Atomic optimistic concurrency update
    if (dto.expectedRevision === undefined || dto.expectedRevision === null) {
      throw new BadRequestException(
        'expectedRevision is required when updating an existing daily record',
      );
    }

    const updateResult = await this.prisma.dailyRecord.updateMany({
      where: {
        userId,
        date: parsedDate,
        revision: dto.expectedRevision,
        deletedAt: null,
      },
      data: {
        headline: dto.headline !== undefined ? dto.headline : undefined,
        healthData: dto.healthData !== undefined ? dto.healthData : undefined,
        reflection: dto.reflection !== undefined ? dto.reflection : undefined,
        revision: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      // Disambiguate without leaking whether record belongs to another user
      const current = await this.prisma.dailyRecord.findFirst({
        where: { userId, date: parsedDate },
      });

      if (!current || current.deletedAt !== null) {
        throw new NotFoundException(`Daily record for ${dateString} not found`);
      }

      throw new ConflictException(
        `Conflict: Record has been modified concurrently. Expected revision: ${dto.expectedRevision}, current revision: ${current.revision}.`,
      );
    }

    return this.findByDate(userId, dateString);
  }
}
