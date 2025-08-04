import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

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
