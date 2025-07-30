import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/notification.dto';
import { Notification } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async markAsRead(id: string, userId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getAllNotificationsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Notification[];
    total: number;
    limit: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      limit,
      totalPages,
      currentPage: page,
    };
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
