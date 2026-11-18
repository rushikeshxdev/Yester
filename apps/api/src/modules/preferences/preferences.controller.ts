import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user preferences and UI layout settings' })
  @ApiQuery({ name: 'userId', required: true, description: 'Sovereign user ID' })
  @ApiResponse({ status: 200, description: 'Preferences returned' })
  async findByUserId(@Query('userId') userId: string) {
    return this.preferencesService.findByUserId(userId);
  }
}
