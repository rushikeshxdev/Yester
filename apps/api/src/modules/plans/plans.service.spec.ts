import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ActivityCategory, PacingType, PlanStatus } from '@prisma/client';
import { PlansService } from './plans.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlansService', () => {
  let service: PlansService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      lifePlan: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    service = new PlansService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create plan with initial milestones and client-minted UUID', async () => {
      mockPrisma.lifePlan.findUnique.mockResolvedValue(null);
      mockPrisma.lifePlan.create.mockResolvedValue({
        id: 'plan-custom-id',
        userId: 'u-1',
        title: 'Run a Marathon',
        statement: 'Finish under 4 hours',
        category: ActivityCategory.FITNESS,
        targetValue: 42,
        unitLabel: 'Km',
        startDate: new Date(Date.UTC(2026, 10, 1)),
        targetDate: new Date(Date.UTC(2026, 11, 31)),
        pacingType: PacingType.LINEAR,
        status: PlanStatus.ACTIVE,
        revision: 1,
        milestones: [
          { id: 'm-1', title: '50% Half', targetPercent: 50, targetValue: 21 },
        ],
      });

      const result = await service.create('u-1', {
        id: 'plan-custom-id',
        title: 'Run a Marathon',
        statement: 'Finish under 4 hours',
        category: ActivityCategory.FITNESS,
        targetValue: 42,
        unitLabel: 'Km',
        startDate: '2026-11-01',
        targetDate: '2026-12-31',
        pacingType: PacingType.LINEAR,
        milestones: [{ title: '50% Half', targetPercent: 50 }],
      });

      expect(mockPrisma.lifePlan.create).toHaveBeenCalled();
      expect(result.id).toBe('plan-custom-id');
      expect(result.startDate).toBe('2026-11-01');
      expect(result.targetDate).toBe('2026-12-31');
    });

    it('should reject creation when targetDate precedes startDate', async () => {
      await expect(
        service.create('u-1', {
          title: 'Invalid Timeline Plan',
          category: ActivityCategory.LEARNING,
          targetValue: 10,
          startDate: '2026-12-01',
          targetDate: '2026-11-01', // Precedes start date!
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject creation if client-minted UUID already exists in database', async () => {
      mockPrisma.lifePlan.findUnique.mockResolvedValue({ id: 'plan-existing' });

      await expect(
        service.create('u-1', {
          id: 'plan-existing',
          title: 'Duplicate Plan',
          category: ActivityCategory.LEARNING,
          targetValue: 10,
          startDate: '2026-11-01',
          targetDate: '2026-12-01',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return plan with complete dynamic trajectory analysis', async () => {
      mockPrisma.lifePlan.findFirst.mockResolvedValue({
        id: 'p-1',
        userId: 'u-1',
        title: 'Deep Learning Mastery',
        targetValue: 100,
        unitLabel: 'Hours',
        startDate: new Date(Date.UTC(2026, 10, 1)),
        targetDate: new Date(Date.UTC(2026, 10, 21)),
        pacingType: PacingType.LINEAR,
        status: PlanStatus.ACTIVE,
        revision: 1,
        milestones: [{ id: 'm-1', title: '50%', targetPercent: 50 }],
        entries: [
          {
            id: 'e-1',
            category: ActivityCategory.LEARNING,
            title: 'Transformers paper',
            planContribution: 60,
            dailyRecord: { date: new Date(Date.UTC(2026, 10, 10)) },
          },
        ],
      });

      const result = await service.findById('u-1', 'p-1', '2026-11-11');
      expect(result.id).toBe('p-1');
      expect(result.trajectory).toBeDefined();
      expect(result.trajectory.actualValue).toBe(60);
      expect(result.trajectory.paceStatus).toBe('ahead');
      expect(result.trajectory.milestones[0].isReached).toBe(true);
    });

    it('should throw NotFoundException if plan does not exist or is soft-deleted', async () => {
      mockPrisma.lifePlan.findFirst.mockResolvedValue(null);

      await expect(service.findById('u-1', 'p-nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should atomically update plan when expectedRevision matches', async () => {
      mockPrisma.lifePlan.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.lifePlan.findFirst.mockResolvedValue({
        id: 'p-1',
        userId: 'u-1',
        title: 'Updated Plan Title',
        targetValue: 120,
        startDate: new Date(Date.UTC(2026, 10, 1)),
        targetDate: new Date(Date.UTC(2026, 10, 21)),
        pacingType: PacingType.LINEAR,
        status: PlanStatus.ACTIVE,
        revision: 2,
        milestones: [],
        entries: [],
      });

      const result = await service.update('u-1', 'p-1', {
        title: 'Updated Plan Title',
        targetValue: 120,
        expectedRevision: 1,
      });

      expect(mockPrisma.lifePlan.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'p-1',
          userId: 'u-1',
          revision: 1,
          deletedAt: null,
        },
        data: {
          title: 'Updated Plan Title',
          statement: undefined,
          targetValue: 120,
          unitLabel: undefined,
          pacingType: undefined,
          status: undefined,
          revision: { increment: 1 },
        },
      });
      expect(result.title).toBe('Updated Plan Title');
    });

    it('should throw ConflictException (409) on revision mismatch', async () => {
      mockPrisma.lifePlan.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.lifePlan.findFirst.mockResolvedValue({
        id: 'p-1',
        userId: 'u-1',
        revision: 2, // current revision
        deletedAt: null,
      });

      await expect(
        service.update('u-1', 'p-1', {
          title: 'Stale edit',
          expectedRevision: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException (404) if plan belongs to another user', async () => {
      mockPrisma.lifePlan.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.lifePlan.findFirst.mockResolvedValue(null);

      await expect(
        service.update('u-1', 'p-foreign', {
          title: 'Cross user update attempt',
          expectedRevision: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft-delete plan without deleting linked journal entries', async () => {
      mockPrisma.lifePlan.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.delete('u-1', 'p-1', 1);

      expect(mockPrisma.lifePlan.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'p-1',
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

    it('should throw NotFoundException if plan does not exist or is already soft-deleted', async () => {
      mockPrisma.lifePlan.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.lifePlan.findFirst.mockResolvedValue(null);

      await expect(service.delete('u-1', 'p-nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
