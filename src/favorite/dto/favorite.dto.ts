import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ example: '123asd' })
  @IsString()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '123asd' })
  @IsString()
  @IsUUID()
  watchId: string;
}

export class RemoveFavoriteDto {
  @ApiProperty({
    example: ['favorite-id-1', 'favorite-id-2'],
    description: 'List of favorite item IDs to remove',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  favoriteIds: string[];
}

export class FavoriteResponseDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsString()
  @IsUUID()
  userId: string;

  @IsString()
  @IsUUID()
  watchId: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsOptional()
  user?: any;

  @IsOptional()
  watch?: any;
}
