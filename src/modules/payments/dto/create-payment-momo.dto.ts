import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreatePaymentMomoDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  orderInfo: string;

  @IsString()
  @IsOptional()
  extraData?: string;

  @IsString()
  @IsOptional()
  orderGroupId?: string;

  @IsBoolean()
  @IsOptional()
  autoCapture?: boolean = true;

  @IsString()
  @IsOptional()
  lang?: string;
}
