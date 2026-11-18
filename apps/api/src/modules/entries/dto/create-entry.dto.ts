import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateEntryDto {
  @ApiPropertyOptional({
    description: 'Client-minted UUID for the entry (optional, minted by server if omitted)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id?: string;

  @ApiProperty({
    description: 'ID of the parent DailyRecord envelope',
    example: 'd9b2d63d-a233-4f9e-bb9f-8647781b0a70',
  })
  @IsUUID('4', { message: 'dailyRecordId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'dailyRecordId cannot be empty' })
  dailyRecordId!: string;

  @ApiProperty({
    description: 'Activity category',
    enum: ActivityCategory,
    example: ActivityCategory.WORK,
  })
  @IsEnum(ActivityCategory, {
    message: 'category must be one of: WORK, FITNESS, LEARNING, PROJECT, PERSONAL',
  })
  category!: ActivityCategory;

  @ApiProperty({
    description: 'Entry title or summary',
    example: 'Engineered sovereign auth and optimistic concurrency handlers',
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title cannot be empty' })
  @MaxLength(255, { message: 'title cannot exceed 255 characters' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Optional UUID of the linked LifePlan',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'planId must be a valid UUID v4' })
  planId?: string | null;

  @ApiPropertyOptional({
    description: 'Contribution amount towards the linked LifePlan',
    example: 1.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'planContribution must be a number' })
  planContribution?: number | null;

  @ApiPropertyOptional({
    description: 'Category-specific arbitrary metadata or payload',
    example: { durationMinutes: 90, deepWork: true, tags: ['core-engine', 'backend'] },
  })
  @IsOptional()
  @IsObject({ message: 'payload must be a valid JSON object' })
  payload?: Record<string, any>;
}
