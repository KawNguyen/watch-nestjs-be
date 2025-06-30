import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class GetALlCoupon {
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

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export class CreateCouponDto {
  @ApiProperty({ maxLength: 50, example: 'SALE50' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'End of year discount' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENT })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ minimum: 0, example: 50 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ minimum: 0, example: 500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ minimum: 0, example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  count?: number;

  @ApiProperty({ example: '2025-06-20T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-07-20T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'SUMMER30' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Summer sale' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: DiscountType, example: DiscountType.FIXED })
  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @ApiPropertyOptional({ example: 300000 })
  @IsOptional()
  @IsNumber()
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  count?: number;

  @ApiPropertyOptional({ example: '2025-06-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
