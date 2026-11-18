import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DailyRecordsService', () => {
  let service: DailyRecordsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      dailyRecord: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    service = new DailyRecordsService(mockPrisma as unknown as PrismaService);
  });

  describe('findByDate', () => {
    it('should return daily record with formatted YYYY-MM-DD date', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-1',
        userId: 'u-1',
        date: new Date(Date.UTC(2026, 10, 18)),
        headline: 'Great day',
        deletedAt: null,
        revision: 1,
        entries: [],
      });

      const result = await service.findByDate('u-1', '2026-11-18');
      expect(result.id).toBe('rec-1');
      expect(result.date).toBe('2026-11-18');
    });

    it('should throw NotFoundException if record does not exist or is soft-deleted', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue(null);
      await expect(service.findByDate('u-1', '2026-11-18')).rejects.toThrow(NotFoundException);

      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-deleted',
        deletedAt: new Date(),
      });
      await expect(service.findByDate('u-1', '2026-11-18')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should create new record when none exists', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue(null);
      mockPrisma.dailyRecord.create.mockResolvedValue({
        id: 'rec-new',
        userId: 'u-1',
        date: new Date(Date.UTC(2026, 10, 18)),
        headline: 'New day',
        revision: 1,
        entries: [],
      });

      const result = await service.upsert('u-1', '2026-11-18', {
        headline: 'New day',
      });

      expect(mockPrisma.dailyRecord.create).toHaveBeenCalled();
      expect(result.id).toBe('rec-new');
      expect(result.revision).toBe(1);
    });

    it('should throw BadRequestException if expectedRevision is missing when updating existing record', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-existing',
        deletedAt: null,
        revision: 2,
      });

      await expect(
        service.upsert('u-1', '2026-11-18', { headline: 'Update without revision' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should atomically update and increment revision when expectedRevision matches', async () => {
      mockPrisma.dailyRecord.findUnique
        .mockResolvedValueOnce({
          id: 'rec-existing',
          deletedAt: null,
          revision: 2,
        })
        .mockResolvedValueOnce({
          id: 'rec-existing',
          userId: 'u-1',
          date: new Date(Date.UTC(2026, 10, 18)),
          headline: 'Updated headline',
          deletedAt: null,
          revision: 3,
          entries: [],
        });

      mockPrisma.dailyRecord.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.upsert('u-1', '2026-11-18', {
        headline: 'Updated headline',
        expectedRevision: 2,
      });

      expect(mockPrisma.dailyRecord.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'u-1',
          date: expect.any(Date),
          revision: 2,
          deletedAt: null,
        },
        data: {
          headline: 'Updated headline',
          healthData: undefined,
          reflection: undefined,
          revision: { increment: 1 },
        },
      });
      expect(result.revision).toBe(3);
    });

    it('should throw ConflictException (409) with current revision details on revision mismatch', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-existing',
        deletedAt: null,
        revision: 3,
      });
      mockPrisma.dailyRecord.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.dailyRecord.findFirst.mockResolvedValue({
        id: 'rec-existing',
        userId: 'u-1',
        revision: 3,
        deletedAt: null,
      });

      await expect(
        service.upsert('u-1', '2026-11-18', {
          headline: 'Stale update',
          expectedRevision: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException (404) if record was deleted before update could apply', async () => {
      mockPrisma.dailyRecord.findUnique.mockResolvedValue({
        id: 'rec-existing',
        deletedAt: null,
        revision: 2,
      });
      mockPrisma.dailyRecord.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.dailyRecord.findFirst.mockResolvedValue(null);

      await expect(
        service.upsert('u-1', '2026-11-18', {
          headline: 'Update on deleted',
          expectedRevision: 2,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
