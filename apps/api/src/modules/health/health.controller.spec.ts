import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthController (Unit)', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockPrismaService = {
    pingDatabase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/health (Liveness)', () => {
    it('should return status ok with uptime and timestamp', () => {
      const result = controller.getLiveness();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('v1');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('GET /api/v1/health/ready (Readiness)', () => {
    it('should return ready and connected when database ping succeeds', async () => {
      mockPrismaService.pingDatabase.mockResolvedValue(true);

      const result = await controller.getReadiness();

      expect(result).toBeDefined();
      expect(result.status).toBe('ready');
      expect(result.database).toBe('connected');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should throw ServiceUnavailableException when database ping fails', async () => {
      mockPrismaService.pingDatabase.mockResolvedValue(false);

      await expect(controller.getReadiness()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
