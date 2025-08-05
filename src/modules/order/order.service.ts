import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly couponService: CouponService,
  ) {}

  async statisticsOrders(dto: GetOrdersStatisticsDto) {
    const { startDate, endDate, status } = dto;

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
          coupon: true,
          _count: {
            select: {
              orderItems: true,
            },
          },
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

  async getOrdersForTracking(query: string) {
    const whereClause: any = {};

    if (query) {
      whereClause.user = {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      };
    }

    const orders = await this.prismaService.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItems: true,
      },
    });

    if (orders.length === 0) {
      throw new NotFoundException(
        'No orders found with the provided tracking number',
      );
    }

    return orders;
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
                brand: true,
                movement: true,
                bandMaterial: true,
                material: true,
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

  async trackingOrder(trackingNumber: string, phoneLast4Digits: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: trackingNumber },
      include: {
        orderItems: true,
        user: true,
        coupon: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const userPhone = order.user?.phone;
    if (!userPhone || userPhone.length < 4) {
      throw new UnauthorizedException('Số điện thoại không hợp lệ');
    }

    const actualLast4 = userPhone.slice(-4);

    if (phoneLast4Digits !== actualLast4) {
      throw new UnauthorizedException('Xác minh số điện thoại thất bại');
    }

    return order;
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

    const watchIds = selectedCartItems.map((item) => item.watchId);
    const inventories = await this.prismaService.watchInventory.findMany({
      where: { watchId: { in: watchIds } },
      select: { watchId: true, quantity: true },
    });

    const inventoryMap = new Map(
      inventories.map((inv) => [inv.watchId, inv.quantity]),
    );

    for (const cartItem of selectedCartItems) {
      const availableQuantity = inventoryMap.get(cartItem.watchId) || 0;

      if (cartItem.quantity > availableQuantity) {
        throw new BadRequestException(
          `Sản phẩm hiện tại không đủ số lượng. Xin quý khách liên hệ cửa hàng`,
        );
      }
    }

    const orderItemsData = selectedCartItems.map((item) => ({
      watchId: item.watchId,
      quantity: item.quantity,
      price: item.watch.price,
    }));

    const { totalPrice } = await this.calculateDiscount(
      originalPrice,
      userId,
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
        for (const cartItem of selectedCartItems) {
          await tx.watchInventory.update({
            where: { watchId: cartItem.watchId },
            data: {
              quantity: { decrement: cartItem.quantity },
            },
          });
        }

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
            message: `Đơn hàng #${createdOrder.id} đã được tạo thành công!`,
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

    const watchIds = dto.cartItems
      .map((item) => item.watchId)
      .filter((id): id is string => typeof id === 'string');

    const inventories = await this.prismaService.watchInventory.findMany({
      where: { watchId: { in: watchIds } },
      select: { watchId: true, quantity: true },
    });

    const inventoryMap = new Map(
      inventories.map((inv) => [inv.watchId, inv.quantity]),
    );

    for (const item of dto.cartItems) {
      if (!item.watchId) {
        throw new BadRequestException('Invalid watchId in cart item');
      }
      const availableQuantity = inventoryMap.get(item.watchId) || 0;

      if (item.quantity > availableQuantity) {
        const watch = await this.prismaService.watch.findUnique({
          where: { id: item.watchId },
          select: { name: true },
        });

        throw new BadRequestException(
          `Insufficient stock for ${watch?.name || 'product'}. Available: ${availableQuantity}, Requested: ${item.quantity}`,
        );
      }
    }

    const originalPrice = dto.originalPrice;

    const orderItemsData = dto.cartItems.map((item) => ({
      watchId: item.watchId,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalPrice = originalPrice;

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
      const order = await this.prismaService.$transaction(async (tx) => {
        for (const item of dto.cartItems) {
          await tx.watchInventory.update({
            where: { watchId: item.watchId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }

        const createdOrder = await tx.order.create({
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
          dto.walkinInformation?.email ?? '',
          createdOrder.id,
        );

        return createdOrder;
      });

      return order;
    } catch (error) {
      console.error('Error creating walk-in order:', error);
      throw new Error('Failed to create walk-in order');
    }
  }

  private async calculateDiscount(
    originalPrice: number,
    userId: string,
    couponId?: string,
  ) {
    let totalPrice = originalPrice;
    let discountAmount = 0;

    if (couponId) {
      const coupon = await this.prismaService.coupon.findUnique({
        where: { id: couponId },
      });

      if (!coupon) {
        throw new BadRequestException('Invalid coupon ID');
      }

      if (coupon.discountType === 'PERCENT') {
        discountAmount = originalPrice * (coupon.discountValue / 100);
      } else if (coupon.discountType === 'FIXED') {
        discountAmount = coupon.discountValue;
      } else {
        throw new BadRequestException('Invalid coupon type');
      }

      await this.couponService.markCouponAsUsed(userId, coupon.id);

      totalPrice = originalPrice - discountAmount;

      if (totalPrice < 0) {
        totalPrice = 0;
      }
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
      DELIVERED: [],
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
          PROCESSING: `Đơn hàng #${order.id} của bạn đã được duyệt.`,
          SHIPPING: `Đơn hàng #${order.id} của bạn đang được giao hàng!`,
          DELIVERED: `Đơn hàng #${order.id} của bạn đã được giao đến. Cảm ơn bạn!`,
        };

        const message =
          messages[next] ?? `Đơn hàng #${order.id} của bạn đã được cập nhật.`;

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
              message: `Đơn hàng #${order.id} của bạn đã bị hủy vì lý do: ${cancelDto.reason}.`,
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
              message: `Đơn hàng #${order.id} của bạn đã bị hủy bởi quản trị viên. Lý do: ${cancelDto.reason}`,
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

  async completeOrder(orderId: string, requesterId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId, userId: requesterId },
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

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Only orders with DELIVERED status can be completed',
      );
    }

    try {
      await this.prismaService.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });
      });

      return { message: 'Order marked as completed successfully' };
    } catch (error) {
      console.error('Error completing order:', error);
      throw new Error('Failed to complete order');
    }
  }
}
