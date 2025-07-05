import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Unique slug for the blog' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'Content of the blog' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL (optional)' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: 'ID of the user creating the blog' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Publish status (optional)' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
