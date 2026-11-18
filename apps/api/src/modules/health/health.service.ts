import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface LivenessResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: 'v1',
    };
  }

  async getReadiness(): Promise<ReadinessResponse> {
    const isDbConnected = await this.prisma.pingDatabase();

    const response: ReadinessResponse = {
      status: isDbConnected ? 'ready' : 'unhealthy',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };

    if (!isDbConnected) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}
