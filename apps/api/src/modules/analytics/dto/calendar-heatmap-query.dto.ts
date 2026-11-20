import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class CalendarHeatmapQueryDto {
  @ApiProperty({
    description: 'Calendar year for the heatmap (e.g. 2026)',
    example: 2026,
  })
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer' })
  @Min(1900, { message: 'year must be >= 1900' })
  @Max(2200, { message: 'year must be <= 2200' })
  year!: number;
}
