import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddFavoriteDto } from './dto/favorite.dto';
import { assertIsOwner } from 'src/common/helpers/assert-is-owner.helpers';
import { validateUserAndWatch } from 'src/common/helpers/validate-user-and-watch.helper.helpers';

@Injectable()
export class FavoriteService {
  constructor(private prismaService: PrismaService) {}

  async getFavoriteME(userId: string, requesterId: string) {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    assertIsOwner(userId, requesterId, 'access');

    return this.prismaService.favorite.findMany({
      where: { userId },
      select: {
        userId: true,
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
            banner: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });
  }

  async addFavorite(addFavoriteDto: AddFavoriteDto, requesterId: string) {
    const { userId, watchId } = addFavoriteDto;

    await validateUserAndWatch(this.prismaService, userId, watchId);

    const existingFavorite = await this.prismaService.favorite.findUnique({
      where: {
        userId_watchId: {
          userId,
          watchId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Favorite already exist');
    }

    if (userId !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to add favorite this profile',
      );
    }

    const favorite = await this.prismaService.favorite.create({
      data: {
        userId,
        watchId,
      },
    });

    return favorite;
  }

  async removeFavorites(userId: string, favoriteIds: string[]) {
    if (!favoriteIds || favoriteIds.length === 0) {
      throw new ForbiddenException('No favorite IDs provided');
    }

    const favorites = await this.prismaService.favorite.findMany({
      where: {
        id: { in: favoriteIds },
      },
    });

    const invalidItems = favorites.filter((f) => f.userId !== userId);
    if (invalidItems.length > 0) {
      throw new ForbiddenException('Some favorite items do not belong to you');
    }

    return this.prismaService.favorite.deleteMany({
      where: {
        id: { in: favoriteIds },
        userId,
      },
    });
  }
}
