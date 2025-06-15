import { OrderStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from 'src/user/dto/user.dto';

export class OrderItemDto {
  @IsString()
  watchId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @ValidateNested()
  @Type(() => AddressDto)
  addresses?: AddressDto;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @IsString()
  couponId?: string;

  @IsOptional()
  @IsString()
  shippingNotes?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  orginalPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
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
