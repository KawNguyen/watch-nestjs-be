import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsUrl,
  IsInt,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WatchGender } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WatchImages {
  @ApiProperty({ description: 'Array of image URLs' })
  @IsString()
  absolute_url: string;

  @ApiProperty({ description: 'Array of image public IDs' })
  @IsString()
  public_id: string;
}

export class GetWatchesDto {
  @ApiPropertyOptional({ enum: WatchGender, description: 'Filter by gender' })
  @IsOptional()
  @IsEnum(WatchGender)
  gender?: WatchGender;

  @ApiPropertyOptional({ description: 'Brand ID or name (optional)' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Material ID or name (optional)' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: 'Band material ID or name (optional)' })
  @IsOptional()
  @IsString()
  bandMaterial?: string;

  @ApiPropertyOptional({ description: 'Movement ID or name (optional)' })
  @IsOptional()
  @IsString()
  movement?: string;

  @ApiPropertyOptional({ type: Number, description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Keyword search by name/description' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ type: Number, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    default: 12,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;
}

export class CreateWatchDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: WatchGender, default: WatchGender.UNISEX })
  @IsOptional()
  @IsEnum(WatchGender)
  gender?: WatchGender;

  @ApiProperty()
  @IsUUID()
  brandId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  materialId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bandMaterialId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  movementId: string;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'diameter must be a valid number' })
  diameter?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'waterResistance must be an integer number' })
  waterResistance?: number;

  @ApiPropertyOptional({ type: Number, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'warranty must be an integer number' })
  warranty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiProperty({ type: Number })
  @Type(() => Number)
  @IsNumber({}, { message: 'price must be a valid number' })
  price: number;

  @ApiPropertyOptional({ type: [WatchImages] })
  @IsOptional()
  @IsArray()
  images?: WatchImages[];
}

export class UpdateWatchDto extends CreateWatchDto {}
