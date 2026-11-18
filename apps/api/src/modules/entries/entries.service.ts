import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds an active entry by ID for the authenticated user.
   */
  async findById(userId: string, id: string) {
    const entry = await this.prisma.dailyEntry.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!entry) {
      throw new NotFoundException(`Entry with ID ${id} not found`);
    }

    return entry;
  }

  /**
   * Creates a new granular daily entry with cross-entity ownership checks.
   * - Enforces target dailyRecord belongs to the authenticated user.
   * - Enforces linked lifePlan (if provided) belongs to the authenticated user.
   * - Respects client-minted UUID v4 if provided.
   */
  async create(userId: string, dto: CreateEntryDto) {
    // 1. Cross-entity validation: Verify parent DailyRecord belongs to user
    const record = await this.prisma.dailyRecord.findUnique({
      where: { id: dto.dailyRecordId },
    });

    if (!record || record.userId !== userId || record.deletedAt !== null) {
      throw new BadRequestException('Target daily record does not exist or does not belong to user');
    }

    // 2. Cross-entity validation: Verify linked LifePlan belongs to user (Rule #5)
    if (dto.planId) {
      const plan = await this.prisma.lifePlan.findUnique({
        where: { id: dto.planId },
      });

      if (!plan || plan.userId !== userId || plan.deletedAt !== null) {
        throw new BadRequestException('Linked life plan does not exist or does not belong to user');
      }
    }

    // 3. Client-minted UUID collision prevention
    if (dto.id) {
      const existing = await this.prisma.dailyEntry.findUnique({
        where: { id: dto.id },
      });

      if (existing) {
        throw new ConflictException(`Entry with ID ${dto.id} already exists`);
      }
    }

    // 4. Create entry with initial revision = 1
    return this.prisma.dailyEntry.create({
      data: {
        ...(dto.id ? { id: dto.id } : {}),
        userId,
        dailyRecordId: dto.dailyRecordId,
        category: dto.category,
        title: dto.title,
        planId: dto.planId ?? null,
        planContribution: dto.planContribution ?? null,
        payload: dto.payload ?? {},
        revision: 1,
      },
    });
  }

  /**
   * Atomically updates an entry using optimistic concurrency control.
   * Disambiguates 404 (not found / not owned) vs 409 (revision conflict).
   */
  async update(userId: string, id: string, dto: UpdateEntryDto) {
    // Cross-entity check if planId is being modified
    if (dto.planId) {
      const plan = await this.prisma.lifePlan.findUnique({
        where: { id: dto.planId },
      });

      if (!plan || plan.userId !== userId || plan.deletedAt !== null) {
        throw new BadRequestException('Linked life plan does not exist or does not belong to user');
      }
    }

    const updateResult = await this.prisma.dailyEntry.updateMany({
      where: {
        id,
        userId,
        revision: dto.expectedRevision,
        deletedAt: null,
      },
      data: {
        title: dto.title !== undefined ? dto.title : undefined,
        category: dto.category !== undefined ? dto.category : undefined,
        planId: dto.planId !== undefined ? dto.planId : undefined,
        planContribution: dto.planContribution !== undefined ? dto.planContribution : undefined,
        payload: dto.payload !== undefined ? dto.payload : undefined,
        revision: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      // Disambiguate without leaking foreign entity existence
      const existing = await this.prisma.dailyEntry.findFirst({
        where: { id, userId },
      });

      if (!existing || existing.deletedAt !== null) {
        throw new NotFoundException(`Entry with ID ${id} not found`);
      }

      throw new ConflictException(
        `Conflict: Entry has been modified concurrently. Expected revision: ${dto.expectedRevision}, current revision: ${existing.revision}.`,
      );
    }

    return this.findById(userId, id);
  }

  /**
   * Soft-deletes an entry without destroying historical data or plan associations.
   * Sets deletedAt = new Date() and increments revision.
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

    const result = await this.prisma.dailyEntry.updateMany({
      where: whereClause,
      data: {
        deletedAt: new Date(),
        revision: { increment: 1 },
      },
    });

    if (result.count === 0) {
      const existing = await this.prisma.dailyEntry.findFirst({
        where: { id, userId },
      });

      if (!existing || existing.deletedAt !== null) {
        throw new NotFoundException(`Entry with ID ${id} not found`);
      }

      if (expectedRevision !== undefined && existing.revision !== expectedRevision) {
        throw new ConflictException(
          `Conflict: Entry revision mismatch. Expected revision: ${expectedRevision}, current revision: ${existing.revision}.`,
        );
      }

      throw new NotFoundException(`Entry with ID ${id} not found`);
    }

    return {
      message: 'Entry soft-deleted successfully',
      id,
    };
  }
}
