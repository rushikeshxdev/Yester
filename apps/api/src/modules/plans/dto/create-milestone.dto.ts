import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateMilestoneDto {
  @ApiPropertyOptional({
    description: 'Client-minted UUID for the milestone (optional)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'id must be a valid UUID v4' })
  id?: string;

  @ApiProperty({
    description: 'Milestone descriptive title',
    example: '25% Foundation',
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title cannot be empty' })
  @MaxLength(100, { message: 'title cannot exceed 100 characters' })
  title!: string;

  @ApiProperty({
    description: 'Target completion percentage (1 to 100)',
    example: 25,
  })
  @IsNumber({}, { message: 'targetPercent must be a number' })
  @Min(1, { message: 'targetPercent must be at least 1' })
  @Max(100, { message: 'targetPercent cannot exceed 100' })
  targetPercent!: number;
}
