import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'ID of the watch',
    example: 'watch_789',
  })
  @IsString()
  watchId: string;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Price of the item at time of purchase',
    example: 499.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class WalkinInformationDto {
  @ApiProperty({ example: 'Lộc' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Hải' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'tranhailoc7@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0938252473' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '2k Hưng Phú' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Thành phố Hà Nội' })
  @IsString()
  provinceName: string;

  @ApiProperty({ example: 'Quận Nam Từ Liêm' })
  @IsString()
  districtName: string;

  @ApiProperty({ example: 'Phường Phú Đô' })
  @IsString()
  wardName: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID of the address (optional)',
    example: 'address_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiProperty({
    description: 'ID of the coupon (optional)',
    example: 'coupon_456',
    required: false,
  })
  @IsOptional()
  @IsString()
  couponId?: string;

  @ApiProperty({
    description: 'Notes for shipping (optional)',
    example: 'Please deliver after 5 PM',
    required: false,
  })
  @IsOptional()
  @IsString()
  shippingNotes?: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.COD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Walk-in information in JSON format',
    type: WalkinInformationDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WalkinInformationDto)
  walkinInformation?: WalkinInformationDto;

  @ApiProperty({
    description: 'Total price after discount',
    example: 999.99,
  })
  @IsNumber()
  totalPrice: number;

  @ApiProperty({
    description: 'Original price before discount',
    example: 1099.99,
  })
  @IsNumber()
  originalPrice: number;

  @ApiProperty({
    description: 'List of order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems?: OrderItemDto[];
}

export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class GetOrdersDto {
  @ApiProperty({ description: 'Page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Limit', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: 'Keyword for search', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: 'Status order', required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: 'By user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AdminCreateOrderDto {
  @ApiProperty({
    description: 'Walk-in customer information',
    type: WalkinInformationDto,
  })
  @ValidateNested()
  @Type(() => WalkinInformationDto)
  walkinInformation: WalkinInformationDto;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  shippingNotes?: string;

  @ApiProperty({
    description: 'Total price after discount',
    example: 999.99,
  })
  @IsNumber()
  totalPrice: number;

  @ApiProperty({
    description: 'Original price before discount',
    example: 1099.99,
  })
  @IsNumber()
  originalPrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  couponId?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}

export class GetOrdersUserDto {
  @ApiProperty({ description: 'Page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: 'Limit', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ description: 'Status order', required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
