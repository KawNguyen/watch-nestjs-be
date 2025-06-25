import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BrandImageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Link image' })
  absolute_url: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Link image' })
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

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Link image' })
  image: BrandImageDto;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
