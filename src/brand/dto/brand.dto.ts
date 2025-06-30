import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetBrandsDto {
  @IsOptional()
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  page?: number = 1;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 12,
    minimum: 1,
  })
  limit?: number = 12;
}

export class BrandImageDto {
  @IsString()
  @ApiProperty({ example: 'absolute_url image' })
  absolute_url: string;

  @IsString()
  @ApiProperty({ example: 'public_id image' })
  public_id: string;
}

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Rolex' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Switzerland' })
  country: string;

  @IsOptional()
  @ApiPropertyOptional({ type: BrandImageDto })
  image: BrandImageDto;
}

export class UpdateBrandDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Rolex' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Switzerland' })
  country: string;

  @IsOptional()
  @ApiPropertyOptional({ type: BrandImageDto })
  image: BrandImageDto;
}
