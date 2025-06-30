import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetInventoryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: 'Page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Limit', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
