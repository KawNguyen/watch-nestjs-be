import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ReturnRequestStatus } from '@prisma/client';
import { GetReturnRequestsQueryDto } from './dto/create-return-request.dto';

@Injectable()
export class ReturnRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(
    userId: string,
    data: {
      orderId: string;
      orderItemId: string;
      returnQuantity: number;
      reason: string;
      images?: any;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });
    if (!order) throw new BadRequestException('Không tìm thấy đơn hàng');

    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
    });
    if (!orderItem || orderItem.orderId !== data.orderId) {
      throw new BadRequestException(
        'Không tìm thấy sản phẩm trong đơn hàng hoặc sản phẩm không thuộc đơn hàng này',
      );
    }

    if (data.returnQuantity > orderItem.quantity) {
      throw new BadRequestException(
        `Số lượng đổi trả (${data.returnQuantity}) không thể vượt quá số lượng đã đặt (${orderItem.quantity})`,
      );
    }

    const existingReturns = await this.prisma.returnRequest.findMany({
      where: {
        orderItemId: data.orderItemId,
        status: {
          in: [
            ReturnRequestStatus.PENDING,
            ReturnRequestStatus.APPROVED,
            ReturnRequestStatus.COMPLETED,
          ],
        },
      },
    });

    const totalReturnedQuantity = existingReturns.reduce(
      (sum, request) => sum + (request.returnQuantity || 0),
      0,
    );

    const remainingQuantity = orderItem.quantity - totalReturnedQuantity;

    if (data.returnQuantity > remainingQuantity) {
      throw new BadRequestException(
        `Không thể đổi trả ${data.returnQuantity} sản phẩm. Chỉ còn ${remainingQuantity} sản phẩm có thể đổi trả`,
      );
    }

    if (!data.reason || data.reason.trim() === '') {
      throw new BadRequestException('Lý do đổi trả là bắt buộc');
    }

    const returnRequest = await this.prisma.returnRequest.create({
      data: {
        userId: userId,
        orderId: data.orderId,
        orderItemId: data.orderItemId,
        returnQuantity: data.returnQuantity,
        reason: data.reason,
        images: data.images,
      },
    });

    try {
      await this.mailService.sendReturnRequestCreated(
        user.email,
        returnRequest.id,
      );
    } catch (error) {
      console.log('Lỗi gửi email:', error);
    }

    return returnRequest;
  }

  async findAll(params?: { page?: number; limit?: number }) {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const whereClause: any = {
      deletedAt: null,
    };

    const totalItems = await this.prisma.returnRequest.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalItems / limit);

    const returnRequests = await this.prisma.returnRequest.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          select: {
            id: true,
            totalPrice: true,
          },
        },
        orderItem: {
          include: {
            watch: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
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
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        order: true,
        orderItem: {
          include: {
            watch: {
              include: {
                images: {
                  select: {
                    absolute_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!request || request.deletedAt)
      throw new NotFoundException('Không tìm thấy yêu cầu đổi trả');

    return request;
  }

  async findMe(userId: string, dto: GetReturnRequestsQueryDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const whereClause: any = {
      userId,
      status: dto.status,
      deletedAt: null,
    };
    const totalItems = await this.prisma.returnRequest.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalItems / limit);
    const returnRequests = await this.prisma.returnRequest.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        order: {
          select: {
            id: true,
            totalPrice: true,
          },
        },
        orderItem: {
          include: {
            watch: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
    return {
      items: returnRequests,
      totalItems,
      totalPages,
      page,
      limit,
    };
  }

  async updateStatus(id: string, status: ReturnRequestStatus) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: {
        user: true,
        orderItem: {
          include: {
            watch: true,
          },
        },
      },
    });

    if (!request || request.deletedAt)
      throw new NotFoundException('Không tìm thấy yêu cầu đổi trả');

    if (request.status === ReturnRequestStatus.COMPLETED) {
      throw new BadRequestException(
        'Không thể cập nhật yêu cầu đổi trả đã hoàn thành',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.returnRequest.update({
        where: { id },
        data: {
          status,
          processedAt: new Date(),
        },
      });

      if (status === ReturnRequestStatus.COMPLETED) {
        const watchId = request.orderItem.watchId;
        const returnQuantity =
          request.returnQuantity || request.orderItem.quantity;

        const inventory = await tx.watchInventory.findUnique({
          where: { watchId },
        });

        if (inventory) {
          await tx.watchInventory.update({
            where: { watchId },
            data: {
              quantity: inventory.quantity + returnQuantity,
            },
          });
        } else {
          await tx.watchInventory.create({
            data: {
              watchId,
              quantity: returnQuantity,
            },
          });
        }
      }

      try {
        switch (status) {
          case ReturnRequestStatus.APPROVED:
            await this.mailService.sendReturnRequestApproved(
              request.user.email,
              request.id,
            );
            break;
          case ReturnRequestStatus.REJECTED:
            await this.mailService.sendReturnRequestRejected(
              request.user.email,
              request.id,
            );
            break;
          case ReturnRequestStatus.COMPLETED:
            await this.mailService.sendReturnRequestCompleted(
              request.user.email,
              request.id,
            );
        }
      } catch (error) {
        console.log('Lỗi gửi email:', error);
      }

      return updatedRequest;
    });
  }

  async softDelete(id: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Không tìm thấy yêu cầu đổi trả');

    return this.prisma.returnRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
