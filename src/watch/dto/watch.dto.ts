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
} from 'class-validator';
import { Type } from 'class-transformer';
import { WatchGender } from '@prisma/client';

export class GetWatchesDto {
  @IsOptional()
  @IsEnum(WatchGender)
  gender?: WatchGender;

  @IsOptional()
  @IsString()
  brandSlug?: string;

  @IsOptional()
  @IsString()
  materialSlug?: string;

  @IsOptional()
  @IsString()
  bandMaterialSlug?: string;

  @IsOptional()
  @IsString()
  movementSlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;
}


export class CreateWatchDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WatchGender)
  gender?: WatchGender = WatchGender.UNISEX;

  @IsUUID()
  brandId: string;

  @IsOptional()
  @IsUUID()
  materialId: string;

  @IsOptional()
  @IsUUID()
  bandMaterialId: string;

  @IsOptional()
  @IsUUID()
  movementId: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'diameter must be a valid number' })
  diameter?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'waterResistance must be an integer number' })
  waterResistance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'warranty must be an integer number' })
  warranty?: number = 24;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'price must be a valid number' })
  price: number;
}

export class UpdateWatchDto extends CreateWatchDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  poster?: string;

  @IsOptional()
  @IsString()
  banner?: string;
}
