import { generateSlug } from 'src/utils/slug.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWatchDto, GetWatchesDto, UpdateWatchDto } from './dto/watch.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WatchService {
  constructor(private prismaService: PrismaService) {}

  async getWatches(dto: GetWatchesDto) {
    const {
      gender,
      brand,
      material,
      bandMaterial,
      movement,
      minPrice,
      maxPrice,
      keyword,
      page = 1,
    } = dto;

    const skip = (page - 1) * 12;

    const where: Prisma.WatchWhereInput = {
      gender: gender,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
      ...(brand && {
        brand: {
          slug: brand,
        },
      }),
      ...(material && {
        material: {
          slug: material,
        },
      }),
      ...(bandMaterial && {
        bandMaterial: {
          slug: bandMaterial,
        },
      }),
      ...(movement && {
        movement: {
          slug: movement,
        },
      }),
    };

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.watch.findMany({
        where,
        include: {
          // id: true,
          // name: true,
          // slug: true,
          // price: true,
          brand: {
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
          movement: {
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
          poster: {
            select: {
              url: true,
            },
          },
        },
        skip,
        take: 12,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.watch.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit: 12,
      totalPages: Math.ceil(total / 12),
    };
  }

  async getWatchBySlug(slug: string) {
    return this.prismaService.watch.findUnique({
      where: { slug },
      include: {
        brand: true,
        bandMaterial: true,
        material: true,
        movement: true,
        banner: {
          select: {
            url: true,
          },
        },
        poster: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  async createWatch(data: CreateWatchDto) {
    const existingWatch = await this.prismaService.watch.findFirst({
      where: { name: data.name },
    });

    if (existingWatch) {
      throw new BadRequestException(
        `Watch with name "${data.name}" already exists`,
      );
    }

    const slug = generateSlug(data.name);

    const { posterUrls = [], bannerUrl, ...watchData } = data;

    const createdWatch = await this.prismaService.watch.create({
      data: {
        ...watchData,
        slug,
      },
    });

    if (posterUrls.length > 0) {
      await this.prismaService.poster.createMany({
        data: posterUrls.map((url) => ({
          watchId: createdWatch.id,
          url,
        })),
      });
    }

    if (bannerUrl) {
      await this.prismaService.banner.create({
        data: {
          watchId: createdWatch.id,
          url: bannerUrl,
        },
      });
    }

    return {
      ...createdWatch,
      posters: posterUrls,
      banner: bannerUrl,
    };
  }

  async updateWatch(id: string, data: UpdateWatchDto) {
    const existingWatch = await this.prismaService.watch.findUnique({
      where: { id },
      include: {
        poster: true,
        banner: true,
      },
    });

    if (!existingWatch) {
      throw new BadRequestException(`Watch with ID "${id}" does not exist`);
    }

    const slug = generateSlug(data.name || existingWatch.name);

    if (data.posterUrls && data.posterUrls.length > 0) {
      await this.prismaService.poster.deleteMany({
        where: { watchId: id },
      });

      await this.prismaService.poster.createMany({
        data: data.posterUrls.map((url) => ({
          watchId: id,
          url,
        })),
      });
    }

    if (data.bannerUrl) {
      await this.prismaService.banner.deleteMany({
        where: { watchId: id },
      });

      await this.prismaService.banner.create({
        data: {
          watchId: id,
          url: data.bannerUrl,
        },
      });
    }

    const { posterUrls, bannerUrl, ...restData } = data;

    return this.prismaService.watch.update({
      where: { id },
      data: {
        ...restData,
        slug,
      },
    });
  }

  async deleteWatch(id: string) {
    const existingWatch = await this.prismaService.watch.findUnique({
      where: { id },
      include: {
        poster: true,
        banner: true,
      },
    });

    if (!existingWatch) {
      throw new BadRequestException(`Watch with ID "${id}" does not exist`);
    }

    return this.prismaService.watch.delete({
      where: { id },
    });
  }
}
