import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryDashboardStatisticDto {
  @ApiProperty({
    description: 'Start date for statistics (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for statistics (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
