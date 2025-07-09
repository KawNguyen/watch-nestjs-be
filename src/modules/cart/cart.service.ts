import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prismaService: PrismaService) {}

  async getMyCartItems(
    requesterId: string,
    page: number = 1,
    limit: number = 12,
  ) {
    if (!requesterId) {
      throw new BadRequestException('User ID is required');
    }

    const cart = await this.prismaService.cart.findUnique({
      where: { userId: requesterId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for this user.');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.cartItem.findMany({
        where: { cartId: cart.id },
        select: {
          id: true,
          quantity: true,
          watch: {
            select: {
              id: true,
              name: true,
              gender: true,
              diameter: true,
              waterResistance: true,
              warranty: true,
              price: true,
              brand: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              movement: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              material: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              bandMaterial: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              images: {
                select: {
                  absolute_url: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.cartItem.count({
        where: { cartId: cart.id },
      }),
    ]);

    return {
      items,
      totalItems: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addToCart(userId: string, addCartItemDto: AddCartItemDto) {
    let cart = await this.prismaService.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prismaService.cart.create({
        data: {
          userId,
        },
      });
    }

    const existingCartItem = await this.prismaService.cartItem.findFirst({
      where: {
        cartId: cart.id,
        watchId: addCartItemDto.watchId,
      },
    });

    if (existingCartItem) {
      return this.prismaService.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + addCartItemDto.quantity,
        },
      });
    } else {
      return this.prismaService.cartItem.create({
        data: {
          cartId: cart.id,
          watchId: addCartItemDto.watchId,
          quantity: addCartItemDto.quantity,
        },
      });
    }
  }

  async updateQuantityCartItem(
    userId: string,
    cartItemId: string,
    newQuantity: number,
  ) {
    if (newQuantity < 1) {
      throw new ForbiddenException('Quantity must be at least 1.');
    }

    const cartItem = await this.prismaService.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found.');
    }

    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this cart item.',
      );
    }

    return this.prismaService.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: newQuantity,
      },
    });
  }

  async removeCartItems(userId: string, cartItemIds: string[]) {
    if (!cartItemIds || cartItemIds.length === 0) {
      throw new ForbiddenException('No cart item IDs provided.');
    }

    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: { in: cartItemIds },
      },
      include: {
        cart: true,
      },
    });

    if (cartItems.length === 0) {
      throw new NotFoundException('No matching cart items found.');
    }

    const unauthorizedItem = cartItems.find(
      (item) => item.cart.userId !== userId,
    );

    if (unauthorizedItem) {
      throw new ForbiddenException(
        'You do not have permission to remove some cart items.',
      );
    }

    await this.prismaService.cartItem.deleteMany({
      where: {
        id: { in: cartItemIds },
      },
    });

    return {
      message: 'Cart items removed successfully.',
      count: cartItems.length,
    };
  }
}
