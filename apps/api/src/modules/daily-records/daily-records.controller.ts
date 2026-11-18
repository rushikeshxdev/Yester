import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DailyRecordsService } from './daily-records.service';

@ApiTags('Daily Records')
@Controller('daily-records')
export class DailyRecordsController {
  constructor(private readonly dailyRecordsService: DailyRecordsService) {}

  @Get(':date')
  @ApiOperation({ summary: 'Get daily record by calendar date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'userId', required: true, description: 'Sovereign user ID' })
  @ApiResponse({ status: 200, description: 'Daily record with linked entries' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async findByDate(
    @Param('date') date: string,
    @Query('userId') userId: string,
  ) {
    return this.dailyRecordsService.findByDate(userId, date);
  }
}
