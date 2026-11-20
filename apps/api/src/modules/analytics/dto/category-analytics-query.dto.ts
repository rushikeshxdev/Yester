import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CategoryAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Calendar year for category breakdown and monthly comparison (e.g. 2026)',
    example: 2026,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer' })
  @Min(1900, { message: 'year must be >= 1900' })
  @Max(2200, { message: 'year must be <= 2200' })
  year?: number;

  @ApiPropertyOptional({
    description: 'Optional custom start date filter (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString({ message: 'startDate must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be formatted as YYYY-MM-DD' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Optional custom end date filter (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString({ message: 'endDate must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be formatted as YYYY-MM-DD' })
  endDate?: string;
}
