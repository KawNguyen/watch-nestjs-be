import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReturnRequestDto {
    
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  images?: string;
}
