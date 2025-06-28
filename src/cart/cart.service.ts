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

  async getCartItemsMe(
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
          watch: {
            include: {
              brand: true,
              movement: true,
              material: true,
              bandMaterial: true,
              images: true,
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
      items: items.map((item: any) => ({
        id: item.watch.id,
        name: item.watch.name,
        slug: item.watch.slug,
        description: item.watch.description,
        price: item.watch.price,
        brand: {
          id: item.watch.brand.id,
          name: item.watch.brand.name,
          slug: item.watch.brand.slug,
        },
        movement: {
          id: item.watch.movement.id,
          name: item.watch.movement.name,
          slug: item.watch.movement.slug,
        },
        material: {
          id: item.watch.material.id,
          name: item.watch.material.name,
          slug: item.watch.material.slug,
        },
        bandMaterial: {
          id: item.watch.bandMaterial.id,
          name: item.watch.bandMaterial.name,
          slug: item.watch.bandMaterial.slug,
        },
        images: item.watch.images.map((img: any) => ({
          absolute_url: img.absolute_url,
          public_id: img.public_id,
        })),
      })),
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
