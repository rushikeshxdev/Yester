import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DailyRecordsService } from './daily-records.service';
import { UpsertDailyRecordDto } from './dto/upsert-daily-record.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Daily Records')
@ApiBearerAuth()
@Controller('daily-records')
export class DailyRecordsController {
  constructor(private readonly dailyRecordsService: DailyRecordsService) {}

  @Get(':date')
  @ApiOperation({
    summary: 'Get daily record envelope and entries for a calendar date (YYYY-MM-DD)',
  })
  @ApiParam({ name: 'date', example: '2026-11-18', description: 'Calendar date in YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Daily record envelope with active entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Record not found for given date' })
  async findByDate(
    @Param('date') date: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.dailyRecordsService.findByDate(userId, date);
  }

  @Put(':date')
  @ApiOperation({
    summary: 'Atomic upsert daily record envelope with optimistic concurrency control',
    description:
      'Creates the record if it does not exist (revision 1), or atomically updates it if expectedRevision matches current revision.',
  })
  @ApiParam({ name: 'date', example: '2026-11-18', description: 'Calendar date in YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Record created or updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or missing expectedRevision' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict: Record revision mismatch' })
  async upsert(
    @Param('date') date: string,
    @Body() dto: UpsertDailyRecordDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.dailyRecordsService.upsert(userId, date, dto);
  }
}
