import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class UpsertDailyRecordDto {
  @ApiPropertyOptional({
    description: 'Client-minted UUID for the daily record (optional, minted by server if omitted)',
    example: 'd9b2d63d-a233-4f9e-bb9f-8647781b0a70',
  })
  @IsOptional()
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id?: string;

  @ApiPropertyOptional({
    description: 'Headline or summary for the day',
    example: 'Shipped sovereign authentication and high-velocity focus day',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headline?: string;

  @ApiPropertyOptional({
    description: 'Structured health metrics payload (sleep, steps, strain, etc.)',
    example: { sleepHours: 7.5, restingHeartRate: 58, steps: 10420 },
  })
  @IsOptional()
  @IsObject()
  healthData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Structured reflection payload (mood, energy, wins, lessons)',
    example: { mood: 'focused', energyScore: 8, lessons: ['Atomic updates avoid race conditions'] },
  })
  @IsOptional()
  @IsObject()
  reflection?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Expected revision number for optimistic concurrency. Required when updating an existing record.',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedRevision?: number;
}
