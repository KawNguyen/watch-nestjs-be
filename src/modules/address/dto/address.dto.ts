import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DistrictDto {
  @ApiPropertyOptional({ description: 'District name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'District code' })
  @IsOptional()
  @IsString()
  code?: string;
}

export class WardDto {
  @ApiPropertyOptional({ description: 'Ward name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Ward code' })
  @IsOptional()
  @IsString()
  code?: string;
}

export class CityDto {
  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'City code' })
  @IsOptional()
  @IsString()
  code?: string;
}

export class CreateAddressDto {
  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsOptional()
  district?: DistrictDto;

  @ApiPropertyOptional({ description: 'Ward' })
  @IsOptional()
  ward?: WardDto;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  city?: CityDto;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  country?: string;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'District' })
  @IsOptional()
  district?: DistrictDto;

  @ApiPropertyOptional({ description: 'Ward' })
  @IsOptional()
  ward?: WardDto;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  city?: CityDto;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;
}
