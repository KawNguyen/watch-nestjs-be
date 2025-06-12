import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddFavoriteDto, RemoveFavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(private prismaService: PrismaService) {}

  async getFavoriteME(userId: string, requesterId: string) {
    console.log(userId);
    if (!userId) {
      throw new ForbiddenException('User ID is required');
    }

    if (userId !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to get all favorites this profile',
      );
    }

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

    await this.validateUserAndWatch(userId, watchId);

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

  async removeFavorite(
    removeFavoriteDto: RemoveFavoriteDto,
    requesterId: string,
  ) {
    const { userId, watchId } = removeFavoriteDto;

    const favorite = await this.prismaService.favorite.findUnique({
      where: {
        userId_watchId: {
          userId,
          watchId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    if (userId !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to add favorite this profile',
      );
    }

    return await this.prismaService.favorite.delete({
      where: {
        userId_watchId: {
          userId,
          watchId,
        },
      },
    });
  }

  private async validateUserAndWatch(
    userId: string,
    watchId: string,
  ): Promise<void> {
    const [user, watch] = await Promise.all([
      this.prismaService.user.findUnique({ where: { id: userId } }),
      this.prismaService.watch.findUnique({ where: { id: watchId } }),
    ]);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!watch) {
      throw new BadRequestException('Watch not found');
    }
  }
}
