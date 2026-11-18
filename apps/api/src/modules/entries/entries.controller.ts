import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Entries')
@ApiBearerAuth()
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get daily entry by ID' })
  @ApiParam({ name: 'id', description: 'Entry UUID' })
  @ApiResponse({ status: 200, description: 'Entry returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.entriesService.findById(userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new daily entry linked to a daily record',
    description:
      'Creates a new entry. Validates that dailyRecordId and optional planId belong to the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Entry created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request / Cross-entity ownership violation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict: Client-minted ID already exists' })
  async create(
    @Body() dto: CreateEntryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.entriesService.create(userId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atomically update daily entry with optimistic concurrency control',
    description:
      'Applies partial updates to title, category, planId, contribution, or payload if expectedRevision matches current revision.',
  })
  @ApiParam({ name: 'id', description: 'Entry UUID' })
  @ApiResponse({ status: 200, description: 'Entry updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict: Revision mismatch' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.entriesService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a daily entry',
    description: 'Marks entry deletedAt with current timestamp and increments revision.',
  })
  @ApiParam({ name: 'id', description: 'Entry UUID' })
  @ApiQuery({
    name: 'expectedRevision',
    required: false,
    description: 'Optional expected revision for concurrency control',
  })
  @ApiResponse({ status: 200, description: 'Entry soft-deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @ApiResponse({ status: 409, description: 'Conflict: Revision mismatch' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Query('expectedRevision') expectedRevision?: string,
  ) {
    const revision = expectedRevision ? parseInt(expectedRevision, 10) : undefined;
    return this.entriesService.delete(userId, id, revision);
  }
}
