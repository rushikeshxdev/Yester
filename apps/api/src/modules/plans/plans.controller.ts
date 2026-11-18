import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'List all active life plans for user with derived progress' })
  @ApiQuery({ name: 'userId', required: true, description: 'Sovereign user ID' })
  @ApiResponse({ status: 200, description: 'List of plans returned' })
  async findAll(@Query('userId') userId: string) {
    return this.plansService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID with dynamic milestone evaluation' })
  @ApiQuery({ name: 'userId', required: true, description: 'Sovereign user ID' })
  @ApiResponse({ status: 200, description: 'Plan returned' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findById(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.plansService.findById(userId, id);
  }
}
