import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityCategory } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEntryDto {
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
    example: 'Refactored optimistic concurrency validation',
  })
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @MaxLength(255, { message: 'title cannot exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated category',
    enum: ActivityCategory,
    example: ActivityCategory.WORK,
  })
  @IsOptional()
  @IsEnum(ActivityCategory, {
    message: 'category must be one of: WORK, FITNESS, LEARNING, PROJECT, PERSONAL',
  })
  category?: ActivityCategory;

  @ApiPropertyOptional({
    description: 'Updated linked LifePlan UUID (or null to unlink)',
    example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'planId must be a valid UUID v4' })
  planId?: string | null;

  @ApiPropertyOptional({
    description: 'Updated contribution towards the linked plan',
    example: 2.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'planContribution must be a number' })
  planContribution?: number | null;

  @ApiPropertyOptional({
    description: 'Updated payload JSON object',
    example: { durationMinutes: 120, completed: true },
  })
  @IsOptional()
  @IsObject({ message: 'payload must be a valid JSON object' })
  payload?: Record<string, any>;
}
