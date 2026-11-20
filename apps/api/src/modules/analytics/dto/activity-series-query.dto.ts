import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from '@prisma/client';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ActivitySeriesQueryDto {
  @ApiProperty({
    description: 'Start date in YYYY-MM-DD format',
    example: '2026-11-01',
  })
  @IsString({ message: 'startDate must be a string' })
  @IsNotEmpty({ message: 'startDate cannot be empty' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be formatted as YYYY-MM-DD' })
  startDate!: string;

  @ApiProperty({
    description: 'End date in YYYY-MM-DD format',
    example: '2026-11-30',
  })
  @IsString({ message: 'endDate must be a string' })
  @IsNotEmpty({ message: 'endDate cannot be empty' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be formatted as YYYY-MM-DD' })
  endDate!: string;

  @ApiPropertyOptional({
    description: 'Granularity of time series aggregation',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
    example: 'daily',
  })
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'], {
    message: "granularity must be 'daily', 'weekly', or 'monthly'",
  })
  granularity?: 'daily' | 'weekly' | 'monthly' = 'daily';

  @ApiPropertyOptional({
    description: 'Optional filter by ActivityCategory',
    enum: ActivityCategory,
    example: ActivityCategory.WORK,
  })
  @IsOptional()
  @IsEnum(ActivityCategory, {
    message: 'category must be one of: WORK, FITNESS, LEARNING, PROJECT, PERSONAL',
  })
  category?: ActivityCategory;
}
