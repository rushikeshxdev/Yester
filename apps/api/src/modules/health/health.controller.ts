import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService, LivenessResponse, ReadinessResponse } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe', description: 'Returns 200 OK if the API process is alive and receiving requests.' })
  @ApiResponse({ status: 200, description: 'Service is alive.' })
  getLiveness(): LivenessResponse {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe', description: 'Verifies real database connectivity via a query ping to PostgreSQL.' })
  @ApiResponse({ status: 200, description: 'Service is ready and database is connected.' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy; database is disconnected.' })
  async getReadiness(): Promise<ReadinessResponse> {
    return this.healthService.getReadiness();
  }
}
