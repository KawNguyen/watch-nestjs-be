import { generateSlug } from 'src/utils/slug.utils';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateWatchDto,
  GetWatchesDto,
  UpdateWatchDto,
  UpdateWatchStatusDto,
} from './dto/watch.dto';
import { Prisma, WatchStatus } from '@prisma/client';

@Injectable()
export class WatchService {
  constructor(private prismaService: PrismaService) {}

  async getWatches(dto: GetWatchesDto) {
    const {
      status,
      genders,
      brands,
      materials,
      bandMaterials,
      movements,
      minPrice,
      maxPrice,
      keyword,
      page = 1,
      limit = 12,
    } = dto;

    const skip = (page - 1) * limit;

    const where: Prisma.WatchWhereInput = {
      ...(status && {
        status: status,
      }),
      ...(genders?.length && { gender: { in: genders } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      }),
      ...(brands?.length && {
        brand: {
          slug: { in: brands },
        },
      }),
      ...(materials?.length && {
        material: {
          slug: { in: materials },
        },
      }),
      ...(bandMaterials?.length && {
        bandMaterial: {
          slug: { in: bandMaterials },
        },
      }),
      ...(movements?.length && {
        movement: {
          slug: { in: movements },
        },
      }),
    };

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.watch.findMany({
        where,
        include: {
          brand: {
            select: { id: true, name: true, slug: true },
          },
          material: {
            select: { id: true, name: true, slug: true },
          },
          bandMaterial: {
            select: { id: true, name: true, slug: true },
          },
          movement: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            select: { absolute_url: true },
          },
          inventory: {
            select: { quantity: true },
          },
        },
        skip,
        take: limit,
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
      limit,
      totalPages: Math.ceil(total / limit),
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
        inventory: {
          select: {
            quantity: true,
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
        inventory: {
          create: {
            quantity: 0,
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
      await this.prismaService.watchImage.createMany({
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
      await this.prismaService.watchImage.deleteMany({
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
    });

    if (!existingWatch) {
      throw new BadRequestException(`Watch with ID "${id}" does not exist`);
    }

    await this.prismaService.watchImage.deleteMany({
      where: { watchId: id },
    });

    // await this.prismaService.favorite.deleteMany({
    //   where: { watchId: id },
    // });

    return this.prismaService.watch.delete({
      where: { id },
    });
  }

  async updateWatchStatus(watchId: string, data: UpdateWatchStatusDto) {
    const existingWatch = await this.prismaService.watch.findUnique({
      where: { id: watchId },
    });

    if (!existingWatch) {
      throw new BadRequestException(
        `Watch with id "${watchId}" does not exist`,
      );
    }

    return await this.prismaService.watch.update({
      where: {
        id: watchId,
      },
      data: {
        status: data.status,
      },
    });
  }
}
