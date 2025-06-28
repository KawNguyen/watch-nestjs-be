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
          images: {
            select: {
              absolute_url: true,
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
        images: {
          select: {
            absolute_url: true,
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

    if (!data.images || data.images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const slug = generateSlug(data.name);

    const { images = [], ...watchData } = data;

    const createdWatch = await this.prismaService.watch.create({
      data: {
        ...watchData,
        slug,
        images: {
          createMany: {
            data: images.map((image) => ({
              absolute_url: image.absolute_url,
              public_id: image.public_id,
            })),
          },
        },
      },
      include: {
        images: true,
      },
    });

    return createdWatch;
  }

  async updateWatch(id: string, data: UpdateWatchDto) {
    const existingWatch = await this.prismaService.watch.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!existingWatch) {
      throw new BadRequestException(`Watch with ID "${id}" does not exist`);
    }

    const slug = generateSlug(data.name || existingWatch.name);

    if (data.images && data.images.length > 0) {
      await this.prismaService.watchImages.createMany({
        data: data.images.map((image) => ({
          watchId: id,
          absolute_url: image.absolute_url,
          public_id: image.public_id,
        })),
      });
    }

    const existingImages = existingWatch.images.map((img) => img.public_id);
    const newImages = data.images
      ? data.images.map((img) => img.public_id)
      : [];
    const imagesToDelete = existingImages.filter(
      (img) => !newImages.includes(img),
    );
    if (imagesToDelete.length > 0) {
      await this.prismaService.watchImages.deleteMany({
        where: {
          watchId: id,
          public_id: { in: imagesToDelete },
        },
      });
    }

    const { images, ...restData } = data;

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
        images: true,
      },
    });

    if (!existingWatch) {
      throw new BadRequestException(`Watch with ID "${id}" does not exist`);
    }

    await this.prismaService.watchImages.deleteMany({
      where: { watchId: id },
    });

    return this.prismaService.watch.delete({
      where: { id },
    });
  }
}
