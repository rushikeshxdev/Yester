import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ActivityCategory } from '@prisma/client';
import { EntriesService } from './entries.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('EntriesService', () => {
  let service: EntriesService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      dailyEntry: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      dailyRecord: {
        findUnique: jest.fn(),
      },
      lifePlan: {
        findUnique: jest.fn(),
      },
    };

    service = new EntriesService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create an entry when parent dailyRecord and plan belong to user', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        userId: 'u-1',
        deletedAt: null,
      });
      mockPrisma.lifePlan.findUnique.mockResolvedValue({
        id: 'plan-1',
        userId: 'u-1',
        deletedAt: null,
      });
      mockPrisma.dailyEntry.create.mockResolvedValue({
        id: 'ent-1',
        userId: 'u-1',
        dailyRecordId: 'rec-1',
        category: ActivityCategory.WORK,
        title: 'Deep work session',
        revision: 1,
      });

      const result = await service.create('u-1', {
        dailyRecordId: 'rec-1',
        category: ActivityCategory.WORK,
        title: 'Deep work session',
        planId: 'plan-1',
        planContribution: 2,
      });

      expect(mockPrisma.dailyEntry.create).toHaveBeenCalled();
      expect(result.id).toBe('ent-1');
      expect(result.revision).toBe(1);
    });

    it('should reject creation if parent dailyRecord belongs to another user (Rule #5)', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-foreign',
        userId: 'u-other', // different user!
        deletedAt: null,
      });

      await expect(
        service.create('u-1', {
          dailyRecordId: 'rec-foreign',
          category: ActivityCategory.WORK,
          title: 'Unauthorized entry',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject creation if linked lifePlan belongs to another user (Rule #5)', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        userId: 'u-1',
        deletedAt: null,
      });
      mockPrisma.lifePlan.findUnique.mockResolvedValue({
        id: 'plan-foreign',
        userId: 'u-other', // foreign plan!
        deletedAt: null,
      });

      await expect(
        service.create('u-1', {
          dailyRecordId: 'rec-1',
          category: ActivityCategory.WORK,
          title: 'Cross-tenant plan link attempt',
          planId: 'plan-foreign',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject creation if client-minted UUID already exists in database', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        userId: 'u-1',
        deletedAt: null,
      });
      mockPrisma.dailyEntry.findUnique.mockResolvedValue({
        id: 'client-uuid-123',
      });

      await expect(
        service.create('u-1', {
          id: 'client-uuid-123',
          dailyRecordId: 'rec-1',
          category: ActivityCategory.WORK,
          title: 'Collision test',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should atomically update entry when expectedRevision matches', async () => {
      mockPrisma.dailyEntry.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.dailyEntry.findFirst.mockResolvedValue({
        id: 'ent-1',
        userId: 'u-1',
        title: 'Updated title',
        revision: 2,
        deletedAt: null,
      });

      const result = await service.update('u-1', 'ent-1', {
        title: 'Updated title',
        expectedRevision: 1,
      });

      expect(mockPrisma.dailyEntry.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'ent-1',
          userId: 'u-1',
          revision: 1,
          deletedAt: null,
        },
        data: {
          title: 'Updated title',
          category: undefined,
          planId: undefined,
          planContribution: undefined,
          payload: undefined,
          revision: { increment: 1 },
        },
      });
      expect(result.revision).toBe(2);
    });

    it('should throw ConflictException (409) on revision mismatch', async () => {
      mockPrisma.dailyEntry.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.dailyEntry.findFirst.mockResolvedValue({
        id: 'ent-1',
        userId: 'u-1',
        revision: 2, // current revision is 2
        deletedAt: null,
      });

      await expect(
        service.update('u-1', 'ent-1', {
          title: 'Stale update',
          expectedRevision: 1, // expected revision 1
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException (404) if entry belongs to another user', async () => {
      mockPrisma.dailyEntry.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.dailyEntry.findFirst.mockResolvedValue(null); // not found for u-1

      await expect(
        service.update('u-1', 'ent-foreign', {
          title: 'Hack attempt',
          expectedRevision: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft-delete entry by setting deletedAt and incrementing revision', async () => {
      mockPrisma.dailyEntry.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.delete('u-1', 'ent-1', 1);

      expect(mockPrisma.dailyEntry.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'ent-1',
          userId: 'u-1',
          revision: 1,
          deletedAt: null,
        },
        data: {
          deletedAt: expect.any(Date),
          revision: { increment: 1 },
        },
      });
      expect(result.message).toContain('soft-deleted');
    });

    it('should throw NotFoundException if entry is already soft-deleted or non-existent', async () => {
      mockPrisma.dailyEntry.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.dailyEntry.findFirst.mockResolvedValue(null);

      await expect(service.delete('u-1', 'ent-nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
