import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnRequestStatus } from '@prisma/client';

export class CreateReturnRequestDto {
  @ApiProperty({
    description: 'ID of the order',
    example: '1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'ID of the order item being returned',
    example: 'abcdef1234567890abcdef12',
  })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({
    description: 'Quantity to return (must be <= ordered quantity)',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  returnQuantity: number;

  @ApiProperty({
    description: 'Reason for the return request',
    example: 'Item is defective',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Optional images related to the return request',
    type: String,
    isArray: true,
    required: false,
  })
  @IsOptional()
  images?: string[];
}

export class GetReturnRequestsQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    type: Number,
  })  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({
    description: 'Filter by return request status',
    enum: ReturnRequestStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReturnRequestStatus)
  status?: ReturnRequestStatus;
}
