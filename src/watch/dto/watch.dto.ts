import { ApiProperty } from '@nestjs/swagger';
import { WatchGender } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsEnum,
  IsArray,
} from 'class-validator';

export class CreateWatchDto {
  @ApiProperty({ example: 'New Watch Name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Detailed description of the watch',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'MALE', enum: WatchGender })
  @IsEnum(WatchGender)
  gender: WatchGender;

  @ApiProperty({ example: 'uuid-of-brand' })
  @IsString()
  brandId: string;

  @ApiProperty({ example: 'uuid-of-material', required: false })
  @IsOptional()
  @IsString()
  materialId?: string;

  @ApiProperty({ example: 'uuid-of-band-material', required: false })
  @IsOptional()
  @IsString()
  bandMaterialId?: string;

  @ApiProperty({ example: 'uuid-of-movement', required: false })
  @IsOptional()
  @IsString()
  movementId?: string;

  @ApiProperty({ example: 40.5, required: false })
  @IsOptional()
  @IsNumber()
  diameter?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsInt()
  waterResistance?: number;

  @ApiProperty({ example: 24, required: false })
  @IsOptional()
  @IsInt()
  warranty?: number;

  @ApiProperty({ example: 'http://example.com/video.mp4', required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['http://example.com/image1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateWatchDto {
  @ApiProperty({ example: 'Updated Watch Name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'FEMALE', enum: WatchGender, required: false })
  @IsOptional()
  @IsEnum(WatchGender)
  gender?: WatchGender;

  @ApiProperty({ example: 'new-uuid-of-brand', required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ example: 'new-uuid-of-material', required: false })
  @IsOptional()
  @IsString()
  materialId?: string;

  @ApiProperty({ example: 'new-uuid-of-band-material', required: false })
  @IsOptional()
  @IsString()
  bandMaterialId?: string;

  @ApiProperty({ example: 'new-uuid-of-movement', required: false })
  @IsOptional()
  @IsString()
  movementId?: string;

  @ApiProperty({ example: 42.0, required: false })
  @IsOptional()
  @IsNumber()
  diameter?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsInt()
  waterResistance?: number;

  @ApiProperty({ example: 36, required: false })
  @IsOptional()
  @IsInt()
  warranty?: number;

  @ApiProperty({ example: 'http://example.com/new-video.mp4', required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['http://example.com/image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
