import { ApiProperty, PartialType } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class GetAllDTO {
  @ApiProperty({ description: 'Page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Limit', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  orderId?: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
