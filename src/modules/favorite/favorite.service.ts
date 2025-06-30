import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddFavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(private prismaService: PrismaService) {}

  async getFavoriteME(userId: string, page: number = 1, limit: number = 12) {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    const skip = (page - 1) * limit;

    const [favorites, total] = await this.prismaService.$transaction([
      this.prismaService.favorite.findMany({
        where: { userId },
        select: {
          id: true,
          watch: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
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
                  public_id: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.favorite.count({ where: { userId } }),
    ]);

    return {
      favorites: favorites.map((fav) => fav.watch),
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addFavorite(addFavoriteDto: AddFavoriteDto, requesterId: string) {
    const { watchId } = addFavoriteDto;

    if (!watchId) {
      throw new ForbiddenException('Watch ID is required');
    }

    const existingFavorite = await this.prismaService.favorite.findUnique({
      where: {
        userId_watchId: {
          userId: requesterId,
          watchId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Favorite already exist');
    }

    const favorite = await this.prismaService.favorite.create({
      data: {
        userId: requesterId,
        watchId,
      },
    });

    return favorite;
  }

  async deleteFavoriteItems(userId: string, favoriteIds: string[]) {
    if (!favoriteIds || favoriteIds.length === 0) {
      throw new ForbiddenException('No favorite IDs provided');
    }

    const existingFavorites = await this.prismaService.favorite.findMany({
      where: {
        id: {
          in: favoriteIds,
        },
      },
    });

    const invalidItems = existingFavorites.filter((f) => f.userId !== userId);
    if (invalidItems.length > 0) {
      throw new ForbiddenException('Some favorite items do not belong to you');
    }

    const result = await this.prismaService.favorite.deleteMany({
      where: {
        id: { in: favoriteIds },
        userId,
      },
    });

    return result;
  }
}
