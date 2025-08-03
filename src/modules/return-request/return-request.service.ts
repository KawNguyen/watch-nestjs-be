import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReturnRequestStatus } from '@prisma/client';

@Injectable()
export class ReturnRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      orderId: string;
      orderItemId: string;
      reason: string;
      description?: string;
      images?: any;
    },
    page: number = 1,
    limit: number = 12,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('User not found');

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });
    if (!order) throw new BadRequestException('Order not found');

    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
    });
    if (!orderItem || orderItem.orderId !== data.orderId) {
      throw new BadRequestException(
        'Order item not found or does not belong to order',
      );
    }

    if (!data.reason || data.reason.trim() === '') {
      throw new BadRequestException('Reason is required');
    }

    return this.prisma.returnRequest.create({
      data: {
        userId: userId,
        orderId: data.orderId,
        orderItemId: data.orderItemId,
        reason: data.reason,
        description: data.description,
        images: data.images,
      },
    });
  }

  async findAll(params?: {
    userId?: string;
    status?: ReturnRequestStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const totalItems = await this.prisma.returnRequest.count({
      where: {
        deletedAt: null,
        ...(params?.userId && { userId: params.userId }),
        ...(params?.status && { status: params.status }),
      },
    });
    const totalPages = Math.ceil(totalItems / limit);
    const returnRequests = await this.prisma.returnRequest.findMany({
      where: {
        deletedAt: null,
        ...(params?.userId && { userId: params.userId }),
        ...(params?.status && { status: params.status }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return {
      items: returnRequests,
      totalItems,
      totalPages,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Return request not found');
    return request;
  }

  async updateStatus(id: string, status: ReturnRequestStatus) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Return request not found');

    return this.prisma.returnRequest.update({
      where: { id },
      data: {
        status,
        processedAt: new Date(),
      },
    });
  }

  // Xóa mềm yêu cầu đổi trả
  async softDelete(id: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Return request not found');

    return this.prisma.returnRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
