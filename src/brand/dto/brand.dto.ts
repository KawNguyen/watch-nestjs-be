import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @ApiProperty({ example: 'Link logo' })
  logo: string;
} 

export class UpdateBrandDto extends PartialType(CreateBrandDto) {} 
