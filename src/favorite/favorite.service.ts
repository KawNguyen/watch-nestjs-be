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

  async getFavoriteME(userId: string) {
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    const favorites = await this.prismaService.favorite.findMany({
      where: { userId },
      select: {
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
    });

    return favorites.map((fav) => {
      const watch = fav.watch;
      return {
        id: watch.id,
        name: watch.name,
        slug: watch.slug,
        description: watch.description,
        price: watch.price,
        brand: watch.brand || 'Unknown',
        movement: watch.movement || 'Unknown',
        material: watch.material || 'Unknown',
        bandMaterial: watch.bandMaterial || 'Unknown',
        images: watch.images.map((img) => ({
          absolute_url: img.absolute_url,
          public_id: img.public_id,
        })),
      };
    });
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
