import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EntriesService } from './entries.service';

@ApiTags('Entries')
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get daily entry by ID' })
  @ApiQuery({ name: 'userId', required: true, description: 'Sovereign user ID' })
  @ApiResponse({ status: 200, description: 'Entry returned' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async findById(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.entriesService.findById(userId, id);
  }
}
