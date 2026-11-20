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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new life plan with initial milestones',
    description: 'Creates a life plan with target values, pacing curve, and initial milestones.',
  })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or targetDate precedes startDate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict: Client-minted ID already exists' })
  async create(
    @Body() dto: CreatePlanDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.plansService.create(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all active life plans for authenticated user with dynamically derived progress',
  })
  @ApiResponse({ status: 200, description: 'List of active plans with derived progress metrics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.plansService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get life plan by ID with complete trajectory analysis, daily chart data, and evaluated milestones',
  })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiQuery({
    name: 'asOfDate',
    required: false,
    example: '2026-11-19',
    description: 'Optional date to evaluate progress as-of (defaults to current calendar date)',
  })
  @ApiResponse({ status: 200, description: 'Detailed plan trajectory analysis returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.plansService.findById(userId, id, asOfDate);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atomically update life plan with optimistic concurrency control',
    description:
      'Updates plan fields (targetValue, pacingType, dates, status) if expectedRevision matches current revision.',
  })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Conflict: Revision mismatch' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.plansService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a life plan',
    description: 'Sets deletedAt timestamp and increments revision without unlinking historical journal entries.',
  })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiQuery({
    name: 'expectedRevision',
    required: false,
    description: 'Optional expected revision for concurrency control',
  })
  @ApiResponse({ status: 200, description: 'Plan soft-deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Conflict: Revision mismatch' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Query('expectedRevision') expectedRevision?: string,
  ) {
    const revision = expectedRevision ? parseInt(expectedRevision, 10) : undefined;
    return this.plansService.delete(userId, id, revision);
  }
}
