import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AdminCreateOrderDto,
  CancelOrderDto,
  CreateOrderDto,
  CreateOrderWalkinDto,
  GetOrdersDto,
  GetOrdersStatisticsDto,
  GetOrdersUserDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { NotificationType, OrderStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async statisticsOrders(dto: GetOrdersStatisticsDto) {
    const { year, month, date, startDate, endDate, status } = dto;

    const filters: any = {};

    if (startDate || endDate) {
      filters.createdAt = {};

      if (startDate) {
        filters.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        filters.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    else if (year && month && date) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const d = parseInt(date, 10);

      if (
        isNaN(y) ||
        isNaN(m) ||
        isNaN(d) ||
        m < 1 ||
        m > 12 ||
        d < 1 ||
        d > 31
      ) {
        throw new BadRequestException('Invalid year, month or date');
      }

      filters.createdAt = {
        gte: new Date(y, m - 1, d, 0, 0, 0, 0),
        lt: new Date(y, m - 1, d + 1, 0, 0, 0, 0),
      };
    }

    if (status) {
      filters.status = status;
    } else {
      filters.status = { not: OrderStatus.CANCELED };
    }

    const [totalPriceAllOrders, totalOrders, orders] = await Promise.all([
      this.prismaService.order.aggregate({
        _sum: {
          totalPrice: true,
        },
        where: filters,
      }),
      this.prismaService.order.count({
        where: filters,
      }),
      this.prismaService.order.findMany({
        where: filters,
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      orders,
      totalPrice: totalPriceAllOrders._sum.totalPrice || 0,
      totalOrders,
    };
  }

  async getBestSellingProducts() {
    const bestSellingProducts = await this.prismaService.orderItem.groupBy({
      by: ['watchId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const productIds = bestSellingProducts.map((item) => item.watchId);

    const products = await this.prismaService.watch.findMany({
      where: { id: { in: productIds } },
      include: {
        images: true,
      },
    });

    return products.map((product) => ({
      ...product,
      totalSold: bestSellingProducts.find((item) => item.watchId === product.id)
        ?._sum.quantity,
    }));
  }

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

  async getOrder(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: {
          include: {
            watch: {
              include: {
                images: true,
              },
            },
          },
        },
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersMe(requesterId: string, dto: GetOrdersUserDto) {
    const { status, page = 1, limit = 12 } = dto;

    const skip = (page - 1) * limit;

    const whereClause = {
      userId: requesterId,
      ...(status && { status }),
    };

    const [orders, totalItems] = await Promise.all([
      this.prismaService.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          orderItems: {
            include: {
              watch: true,
            },
          },
          coupon: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
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

  async createOrderFromCart(userId: string, dto: CreateOrderDto) {
    const originalPrice = dto.originalPrice;
    const cart = await this.prismaService.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: { watch: true },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty or not found');
    }

    if (!dto.cartItems?.length) {
      throw new BadRequestException('No order items provided');
    }

    const cartItemIdsToOrder = dto.cartItems
      .map((item) => item.id)
      .filter((id): id is string => typeof id === 'string');

    const selectedCartItems = cart.cartItems.filter((item) =>
      cartItemIdsToOrder.includes(item.id),
    );

    if (selectedCartItems.length !== cartItemIdsToOrder.length) {
      throw new BadRequestException('Some cart items not found in your cart');
    }

    const orderItemsData = selectedCartItems.map((item) => ({
      watchId: item.watchId,
      quantity: item.quantity,
      price: item.watch.price,
    }));

    const { totalPrice, discountAmount } = await this.calculateDiscount(
      originalPrice,
      dto.couponId,
    );

    const orderData: any = {
      userId,
      paymentMethod: dto.paymentMethod,
      shippingNotes: dto.shippingNotes,
      walkinInformation: null,
      deliveryAddress: dto.deliveryAddress
        ? JSON.stringify(dto.deliveryAddress)
        : null,
      originalPrice,
      totalPrice,
      orderItems: { create: orderItemsData },
      ...(dto.couponId && { couponId: dto.couponId }),
    };

    try {
      const order = await this.prismaService.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: orderData,
          include: {
            user: true,
            orderItems: {
              include: {
                watch: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        });

        await this.mailService.sendOrderSuccess(
          createdOrder.user?.email || '',
          createdOrder.id,
        );

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
            id: { in: cartItemIdsToOrder },
            cartId: cart.id,
          },
        });

        return createdOrder;
      });

      return order;
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw new Error('Failed to create order');
    }
  }

  async createWalkinOrder(dto: CreateOrderWalkinDto) {
    if (!dto.walkinInformation || !dto.cartItems?.length) {
      throw new BadRequestException(
        'Missing walk-in information or order items',
      );
    }

    const originalPrice = dto.originalPrice;

    const orderItemsData = dto.cartItems.map((item) => ({
      watchId: item.watchId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { totalPrice } = await this.calculateDiscount(
      originalPrice,
      dto.couponId,
    );

    const orderData: any = {
      userId: null,
      paymentMethod: dto.paymentMethod,
      shippingNotes: dto.shippingNotes,
      walkinInformation: JSON.stringify(dto.walkinInformation),
      deliveryAddress: dto.deliveryAddress
        ? JSON.stringify(dto.deliveryAddress)
        : null,
      originalPrice,
      totalPrice,
      orderItems: { create: orderItemsData },
      ...(dto.couponId && { couponId: dto.couponId }),
    };

    try {
      const order = await this.prismaService.order.create({
        data: orderData,
        include: {
          orderItems: {
            include: {
              watch: true,
            },
          },
        },
      });

      await this.mailService.sendOrderSuccess(
        dto.walkinInformation.email,
        order.id,
      );

      return order;
    } catch (error) {
      console.error('Error creating walk-in order:', error);
      throw new Error('Failed to create walk-in order');
    }
  }

  private async calculateDiscount(originalPrice: number, couponId?: string) {
    let totalPrice = originalPrice;
    let discountAmount = 0;

    if (couponId) {
      const couponExists = await this.prismaService.coupon.findUnique({
        where: { id: couponId },
      });

      if (!couponExists) {
        throw new BadRequestException('Invalid coupon ID');
      }

      discountAmount = originalPrice * (couponExists.discountValue / 100);
      totalPrice = originalPrice - discountAmount;
    }

    return { totalPrice, discountAmount };
  }

  async adminCreateWalkinOrder(dto: AdminCreateOrderDto) {
    const {
      walkinInformation,
      deliveryAddress,
      paymentMethod,
      shippingNotes,
      originalPrice,
      totalPrice,
      couponId,
      orderItems,
    } = dto;

    if (!orderItems.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // let discountAmount = 0;

    // if (couponId) {
    //   const coupon = await this.prismaService.coupon.findUnique({
    //     where: { id: couponId },
    //   });
    //   if (!coupon) throw new BadRequestException('Invalid coupon');
    //   discountAmount = originalPrice * (coupon.discountValue / 100);
    //   totalPrice = originalPrice - discountAmount;
    // }

    const order = await this.prismaService.order.create({
      data: {
        paymentMethod,
        shippingNotes,
        couponId,
        walkinInformation: JSON.stringify(walkinInformation),
        deliveryAddress: JSON.stringify(deliveryAddress),
        originalPrice,
        totalPrice,
        orderItems: {
          create: orderItems.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            watch: {
              connect: { id: item.watchId },
            },
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return order;
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

    const validTransitions = {
      PENDING: ['PROCESSING'],
      PROCESSING: ['SHIPPING'],
      SHIPPING: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
    };

    const current = order.status;
    const next = updateDto.status;

    if (!validTransitions[current]?.includes(next)) {
      throw new BadRequestException(
        `Cannot transition order from ${current} to ${next}`,
      );
    }

    try {
      const updated = await this.prismaService.$transaction(async (tx) => {
        if (current === 'PENDING' && next === 'PROCESSING') {
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
            status: next,
          },
          include: {
            orderItems: true,
            user: true,
          },
        });

        const messages: Record<string, string> = {
          PROCESSING: `Your order #${order.id} is now being processed.`,
          SHIPPING: `Your order #${order.id} has been shipped!`,
          DELIVERED: `Your order #${order.id} has been delivered. Thank you!`,
        };

        const message =
          messages[next] ?? `Your order #${order.id} has been updated.`;

        if (order.userId) {
          await tx.notification.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              message,
              type: NotificationType.ORDER_UPDATE,
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
