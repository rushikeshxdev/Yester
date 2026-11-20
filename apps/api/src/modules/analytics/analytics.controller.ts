import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { ActivitySeriesQueryDto } from './dto/activity-series-query.dto';
import { CalendarHeatmapQueryDto } from './dto/calendar-heatmap-query.dto';
import { CategoryAnalyticsQueryDto } from './dto/category-analytics-query.dto';
import { OverviewQueryDto } from './dto/overview-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'High-level activity KPIs, streaks and period-over-period comparisons',
    description:
      'Aggregates total entries, active recorded days, consistency rate, streaks, and elapsed delta metrics.',
  })
  @ApiResponse({ status: 200, description: 'Overview statistics returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOverview(
    @CurrentUser('userId') userId: string,
    @Query() query: OverviewQueryDto,
  ) {
    return this.analyticsService.getOverview(userId, query);
  }

  @Get('activity-series')
  @ApiOperation({
    summary: 'Chronological activity time-series curve',
    description:
      'Provides activity volume over time aggregated by daily, weekly, or monthly granularity.',
  })
  @ApiResponse({ status: 200, description: 'Activity time series returned' })
  @ApiResponse({ status: 400, description: 'Invalid date format or range' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActivitySeries(
    @CurrentUser('userId') userId: string,
    @Query() query: ActivitySeriesQueryDto,
  ) {
    return this.analyticsService.getActivitySeries(userId, query);
  }

  @Get('calendar-heatmap')
  @ApiOperation({
    summary: 'Annual contribution-style calendar heatmap',
    description:
      'Calculates 365/366 day activity intensity levels (0-4), start weekday alignment, and weekday distributions.',
  })
  @ApiResponse({ status: 200, description: 'Calendar heatmap matrix returned' })
  @ApiResponse({ status: 400, description: 'Invalid year parameter' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCalendarHeatmap(
    @CurrentUser('userId') userId: string,
    @Query() query: CalendarHeatmapQueryDto,
  ) {
    return this.analyticsService.getCalendarHeatmap(userId, query.year);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Category distribution and monthly stacked comparison',
    description:
      'Returns category volume distribution, percentages, and monthly comparison matrix.',
  })
  @ApiResponse({ status: 200, description: 'Category analytics returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCategoryAnalytics(
    @CurrentUser('userId') userId: string,
    @Query() query: CategoryAnalyticsQueryDto,
  ) {
    return this.analyticsService.getCategoryAnalytics(userId, query);
  }

  @Get('plans')
  @ApiOperation({
    summary: 'Life plan progress with dated trajectory time-series',
    description:
      'Returns cumulative contributions mapped across dates vs expected trajectory curve for all active plans.',
  })
  @ApiResponse({ status: 200, description: 'Life plan progress analytics returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPlanAnalytics(@CurrentUser('userId') userId: string) {
    return this.analyticsService.getPlanAnalytics(userId);
  }
}
