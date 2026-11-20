import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class OverviewQueryDto {
  @ApiPropertyOptional({
    description: 'Calendar year for overview metrics (e.g. 2026)',
    example: 2026,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer' })
  @Min(1900, { message: 'year must be >= 1900' })
  @Max(2200, { message: 'year must be <= 2200' })
  year?: number;

  @ApiPropertyOptional({
    description: 'Calendar month for overview metrics (1-12)',
    example: 11,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'month must be an integer between 1 and 12' })
  @Min(1, { message: 'month must be between 1 and 12' })
  @Max(12, { message: 'month must be between 1 and 12' })
  month?: number;
}
