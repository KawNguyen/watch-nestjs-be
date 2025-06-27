import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BrandImageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Link image' })
  absolute_url: string;

  @IsString()
  @IsNotEmpty()
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

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
