import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CancelOrderDto,
  CreateOrderDto,
  GetOrdersDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllOrders(dto: GetOrdersDto) {
    const { page = 1, limit = 12, keyword, status, userId } = dto;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (keyword) {
      whereClause.user = {
        OR: [
          { email: { contains: keyword, mode: 'insensitive' } },
          { phone: { contains: keyword, mode: 'insensitive' } },
        ],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    const [items, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
            },
          },
          orderItems: true,
          address: true,
          coupon: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.order.count({
        where: whereClause,
      }),
    ]);

    return {
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getOrdersMe(
    requesterId: string,
    status?: string,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: any = { userId: requesterId };

    if (status) {
      whereClause.status = status;
    }

    const [orders, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          orderItems: { include: { watch: true } },
          address: true,
          coupon: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.order.count({
        where: { userId: requesterId },
      }),
    ]);

    return {
      data: orders,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async createOrderFromCart(userId: string, dto: CreateOrderDto) {
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            watch: true,
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty or not found');
    }

    const orderItemsData = cart.cartItems.map((item) => ({
      watchId: item.watchId,
      quantity: item.quantity,
      price: item.watch.price,
    }));

    const originalPrice = orderItemsData.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    let totalPrice = originalPrice;
    let discountAmount = 0;

    if (dto.couponId) {
      const couponExists = await this.prismaService.coupon.findUnique({
        where: { id: dto.couponId },
      });

      if (!couponExists) {
        throw new BadRequestException('Invalid coupon ID');
      }

      discountAmount = originalPrice * (couponExists.discountValue / 100);
      totalPrice = originalPrice - discountAmount;
    }

    const orderData: any = {
      userId,
      addressId: dto.addressId,
      paymentMethod: dto.paymentMethod,
      shippingNotes: dto.shippingNotes,
      orginalPrice: originalPrice,
      totalPrice,
      orderItems: {
        create: orderItemsData,
      },
    };

    if (dto.couponId) {
      orderData.couponId = dto.couponId;
    }

    try {
      const order = await this.prismaService.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: orderData,
          include: {
            user: true,
            orderItems: true,
            address: true,
          },
        });

        await tx.notification.create({
          data: {
            userId,
            orderId: createdOrder.id,
            message: `Your order #${createdOrder.id} has been successfully created!`,
            type: NotificationType.ORDER_CREATE,
            isRead: false,
          },
        });

        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
          },
        });

        return createdOrder;
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    try {
      const updated = await this.prismaService.$transaction(async (tx) => {
        if (order.status === 'PENDING' && updateDto.status === 'PROCESSING') {
          for (const item of order.orderItems) {
            await tx.watchInventory.update({
              where: { watchId: item.watchId },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: updateDto.status,
          },
          include: {
            orderItems: true,
            user: true,
            address: true,
          },
        });

        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              message: `Your order #${order.id} has been successfully created!`,
              type: NotificationType.ORDER_CREATE,
              isRead: false,
            },
          });
        }

        return updatedOrder;
      });

      return updated;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  async cancelOrder(
    orderId: string,
    requesterId: string,
    cancelDto: CancelOrderDto,
  ) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== requesterId) {
      throw new ForbiddenException(
        'You are not authorized to cancel this order',
      );
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Only orders with PENDING status can be cancelled',
      );
    }

    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELED',
            cancellationReason: cancelDto.reason,
          },
        });

        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              message: `Your order #${order.id} has been cancelled for the following reason: ${cancelDto.reason}.`,
              type: NotificationType.ORDER_CANCELED,
              isRead: false,
            },
          });
        }

        for (const item of order.orderItems) {
          await tx.watchInventory.update({
            where: { watchId: item.watchId },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        }
      });

      return { message: 'Order cancelled and inventory updated' };
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  async cancelOrderAsAdmin(orderId: string, cancelDto: CancelOrderDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELED' || order.status === 'COMPLETED') {
      throw new BadRequestException(
        `Cannot cancel an order that is already ${order.status.toLowerCase()}`,
      );
    }

    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELED',
            cancellationReason: cancelDto.reason,
          },
        });

        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              message: `Your order #${order.id} has been cancelled by admin. Reason: ${cancelDto.reason}`,
              type: NotificationType.ORDER_CANCELED,
              isRead: false,
            },
          });
        }

        for (const item of order.orderItems) {
          await tx.watchInventory.update({
            where: { watchId: item.watchId },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        }
      });

      return { message: 'Order cancelled by admin and inventory updated' };
    } catch (error) {
      console.error('Error cancelling order by admin:', error);
      throw new Error('Failed to cancel order by admin');
    }
  }
}
