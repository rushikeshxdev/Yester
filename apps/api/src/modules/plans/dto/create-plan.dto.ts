import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory, PacingType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateMilestoneDto } from './create-milestone.dto';

export class CreatePlanDto {
  @ApiPropertyOptional({
    description: 'Client-minted UUID for the plan (optional, minted by server if omitted)',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id?: string;

  @ApiPropertyOptional({
    description: 'Original creation timestamp (optional, used for lossless migration)',
    example: '2026-11-01T12:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'createdAt must be a valid ISO date string' })
  createdAt?: string;

  @ApiProperty({
    description: 'Plan title',
    example: 'Ship Sovereign Offline Architecture',
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title cannot be empty' })
  @MaxLength(255, { message: 'title cannot exceed 255 characters' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Intention or commitment statement',
    example: 'Deliver a production-grade personal life archive system',
  })
  @IsOptional()
  @IsString({ message: 'statement must be a string' })
  statement?: string;

  @ApiProperty({
    description: 'Category for the life plan',
    enum: ActivityCategory,
    example: ActivityCategory.PROJECT,
  })
  @IsEnum(ActivityCategory, {
    message: 'category must be one of: WORK, FITNESS, LEARNING, PROJECT, PERSONAL',
  })
  category!: ActivityCategory;

  @ApiProperty({
    description: 'Target cumulative value (e.g., 100 hours, 50 workouts)',
    example: 100,
  })
  @IsNumber({}, { message: 'targetValue must be a number' })
  @Min(0.01, { message: 'targetValue must be greater than zero' })
  targetValue!: number;

  @ApiPropertyOptional({
    description: 'Unit of progress measurement',
    example: 'Hours',
    default: 'units',
  })
  @IsOptional()
  @IsString({ message: 'unitLabel must be a string' })
  @MaxLength(50, { message: 'unitLabel cannot exceed 50 characters' })
  unitLabel?: string;

  @ApiProperty({
    description: 'Plan start calendar date (YYYY-MM-DD)',
    example: '2026-11-01',
  })
  @IsString({ message: 'startDate must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be formatted as YYYY-MM-DD' })
  startDate!: string;

  @ApiProperty({
    description: 'Plan target completion calendar date (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsString({ message: 'targetDate must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'targetDate must be formatted as YYYY-MM-DD' })
  targetDate!: string;

  @ApiPropertyOptional({
    description: 'Pacing curve type',
    enum: PacingType,
    default: PacingType.LINEAR,
    example: PacingType.LINEAR,
  })
  @IsOptional()
  @IsEnum(PacingType, { message: 'pacingType must be LINEAR, RAMP_UP, or FRONT_LOADED' })
  pacingType?: PacingType;

  @ApiPropertyOptional({
    description: 'Initial milestones',
    type: [CreateMilestoneDto],
  })
  @IsOptional()
  @IsArray({ message: 'milestones must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];
}
