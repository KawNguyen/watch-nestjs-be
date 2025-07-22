import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: '123asd' })
  @IsString()
  @IsUUID()
  watchId: string;

  @ApiProperty({ description: 'Quantity', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class RemoveCartItemsDto {
  @ApiProperty({
    description: 'Danh sách ID của các cart items cần xoá',
    type: [String],
    example: [
      'f1a2b3c4-d5e6-7890-1234-56789abcde01',
      'abcd1234-5678-90ef-ghij-klmnopqrstuv',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  cartItemIds: string[];
}

export class UpdateQuantityDto {
  @ApiProperty({ description: 'Quantity', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
