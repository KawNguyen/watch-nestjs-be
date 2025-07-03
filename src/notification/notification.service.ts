import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        orderId: createNotificationDto.orderId || null,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getAllNotificationsByUserId(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createOrderNotification(
    userId: string,
    message: string,
    orderId?: string,
  ): Promise<Notification> {
    const createNotificationDto: CreateNotificationDto = {
      userId,
      message,
      orderId,
      type: 'ORDER_UPDATE',
    };

    return this.create(createNotificationDto);
  }
}
