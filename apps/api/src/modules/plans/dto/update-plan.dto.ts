import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PacingType, PlanStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePlanDto {
  @ApiProperty({
    description: 'Expected revision number for atomic optimistic concurrency control',
    example: 1,
  })
  @IsInt({ message: 'expectedRevision must be an integer' })
  @Min(1, { message: 'expectedRevision must be at least 1' })
  @IsNotEmpty({ message: 'expectedRevision is required for optimistic concurrency' })
  expectedRevision!: number;

  @ApiPropertyOptional({
    description: 'Updated title',
    example: 'Ship Sovereign Offline Architecture v2',
  })
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @MaxLength(255, { message: 'title cannot exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated intention statement',
    example: 'Updated personal intention',
  })
  @IsOptional()
  @IsString({ message: 'statement must be a string' })
  statement?: string;

  @ApiPropertyOptional({
    description: 'Updated target cumulative value',
    example: 120,
  })
  @IsOptional()
  @IsNumber({}, { message: 'targetValue must be a number' })
  @Min(0.01, { message: 'targetValue must be greater than zero' })
  targetValue?: number;

  @ApiPropertyOptional({
    description: 'Updated unit label',
    example: 'Hours',
  })
  @IsOptional()
  @IsString({ message: 'unitLabel must be a string' })
  @MaxLength(50, { message: 'unitLabel cannot exceed 50 characters' })
  unitLabel?: string;

  @ApiPropertyOptional({
    description: 'Updated start date (YYYY-MM-DD)',
    example: '2026-11-01',
  })
  @IsOptional()
  @IsString({ message: 'startDate must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be formatted as YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Updated target completion date (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString({ message: 'targetDate must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'targetDate must be formatted as YYYY-MM-DD' })
  targetDate?: string;

  @ApiPropertyOptional({
    description: 'Updated pacing type',
    enum: PacingType,
    example: PacingType.RAMP_UP,
  })
  @IsOptional()
  @IsEnum(PacingType, { message: 'pacingType must be LINEAR, RAMP_UP, or FRONT_LOADED' })
  pacingType?: PacingType;

  @ApiPropertyOptional({
    description: 'Updated plan status',
    enum: PlanStatus,
    example: PlanStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PlanStatus, { message: 'status must be ACTIVE, COMPLETED, PAUSED, or ARCHIVED' })
  status?: PlanStatus;
}
