import { PartialType } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsString, IsUUID, IsEnum } from 'class-validator';

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
