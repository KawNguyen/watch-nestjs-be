import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateStockItemDto {
  @ApiProperty({ description: 'ID of the watch' })
  @IsNotEmpty()
  @IsString()
  watchId: string;

  @ApiProperty({
    description: 'Quantity of the item being added to stock',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Purchase price of the item', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  costPrice: number;
}

export class CreateStockEntryDto {
  @ApiProperty({ description: 'ID of the user adding the stock entry' })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiProperty({ description: 'Notes of the stock entry' })
  @IsString()
  notes: string;

  @ApiProperty({
    description: 'List of stock items being added',
    type: [CreateStockItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockItemDto)
  stockItems: CreateStockItemDto[];
}

export class GetAllStockEntriesDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search keyword (e.g. watch name, code, brand name)',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description: 'Filter by the ID of the user who added the stock entry',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class GetStockStatisticsDto {
  @ApiProperty({ description: 'Year for statistics', required: false })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiProperty({ description: 'Month for statistics', required: false })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({ description: 'Date for statistics', required: false })
  @IsOptional()
  @IsString()
  date?: string;
  
  @ApiProperty({
    description: 'Start date for statistics (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for statistics (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
