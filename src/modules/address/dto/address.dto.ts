import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Ward' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Ward' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;
}
