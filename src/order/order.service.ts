import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertCanAccessResource } from 'src/common/helpers/assert-can-access-resource.helpers';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CancelOrderDto,
  CreateOrderDto,
  GetOrdersDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { assertIsOwner } from 'src/common/helpers/assert-is-owner.helpers';

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllOrders(dto: GetOrdersDto) {
    const { page = 1, limit = 10, keyword, status, userId } = dto;
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

    const [orders, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          orderItems: { include: { watch: true } },
          user: { select: { id: true, email: true, phone: true } },
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
      data: orders,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getOrdersByUserId(
    userId: string,
    requesterId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    assertIsOwner(userId, requesterId);
    const skip = (page - 1) * limit;

    const [orders, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where: { userId },
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
        where: { userId },
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

    const orderItemsData = cart.cartItems.map((item) => {
      return {
        watchId: item.watchId,
        quantity: item.quantity,
        price: item.watch.price,
      };
    });

    const orginalPrice = orderItemsData.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const totalPrice = orginalPrice;

    const order = await this.prismaService.order.create({
      data: {
        userId,
        addressId: dto.addressId,
        couponId: dto.couponId,
        paymentMethod: dto.paymentMethod,
        shippingNotes: dto.shippingNotes,
        orginalPrice,
        totalPrice,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
        address: true,
      },
    });

    for (const item of orderItemsData) {
      await this.prismaService.inventory.update({
        where: { watchId: item.watchId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    await this.prismaService.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return order;
  }

  async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prismaService.order.update({
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

    return updated;
  }

  async cancelOrder(
    orderId: string,
    requesterId: string,
    requesterRole: string,
    cancelDto: CancelOrderDto,
  ) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        status: true,
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    assertCanAccessResource(order.userId, requesterId, requesterRole, {
      action: 'cancel',
    });

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Only orders with PENDING status can be cancelled',
      );
    }

    await this.prismaService.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELED',
        cancellationReason: cancelDto.reason,
      },
    });

    for (const item of order.orderItems) {
      await this.prismaService.inventory.update({
        where: { watchId: item.watchId },
        data: {
          quantity: { increment: item.quantity },
        },
      });
    }
    return { message: 'Order cancelled and inventory updated' };
  }
}
