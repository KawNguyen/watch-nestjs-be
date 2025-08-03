import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class GetAllBlogsDto {
  // @ApiPropertyOptional({
  //   description: 'Filter by public blogs',
  //   required: false,
  // })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublished?: boolean | string = true;
}

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title' })
  @IsString()
  @IsNotEmpty()
  title: string;

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
