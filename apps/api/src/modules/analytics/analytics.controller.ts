import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary archive counts for user' })
  @ApiQuery({ name: 'userId', required: true, description: 'Sovereign user ID' })
  @ApiResponse({ status: 200, description: 'Summary statistics returned' })
  async getSummary(@Query('userId') userId: string) {
    return this.analyticsService.getUserSummary(userId);
  }
}
