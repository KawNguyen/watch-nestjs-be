import { File as MulterFile } from 'multer';

import { generateSlug } from 'src/utils/slug.util';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWatchDto, GetWatchesDto, UpdateWatchDto } from './dto/watch.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WatchService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getWatches(dto: GetWatchesDto) {
    const {
      gender,
      brandSlug,
      materialSlug,
      bandMaterialSlug,
      movementSlug,
      minPrice,
      maxPrice,
      keyword,
      page = 1,
      limit = 12,
    } = dto;

    const skip = (page - 1) * limit;

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
      ...(brandSlug && {
        brand: {
          slug: brandSlug,
        },
      }),
      ...(materialSlug && {
        material: {
          slug: materialSlug,
        },
      }),
      ...(bandMaterialSlug && {
        bandMaterial: {
          slug: bandMaterialSlug,
        },
      }),
      ...(movementSlug && {
        movement: {
          slug: movementSlug,
        },
      }),
    };

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.watch.findMany({
        where,
        include: {
          brand: {
            select: {
              name: true,
            },
          },
          material: {
            select: {
              name: true,
            },
          },
          bandMaterial: {
            select: {
              name: true,
            },
          },
          movement: {
            select: {
              name: true,
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
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.watch.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getWatchById(id: string) {
    return this.prismaService.watch.findUnique({
      where: { id },
    });
  }

  async createWatch(
    data: CreateWatchDto,
    posterFiles: MulterFile[],
    bannerFiles: MulterFile[],
  ) {
    const existingWatch = await this.prismaService.watch.findFirst({
      where: { name: data.name },
    });

    if (existingWatch) {
      throw new BadRequestException(
        `Watch with name "${data.name}" already exists`,
      );
    }

    const slug = generateSlug(data.name);

    const posterUrls = await Promise.all(
      posterFiles.map(async (file) => {
        const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
          file.buffer,
          file.originalname,
        );
        return uploadResult.secure_url;
      }),
    );

    const bannerUrls = await Promise.all(
      bannerFiles.map(async (file) => {
        const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
          file.buffer,
          file.originalname,
        );
        return uploadResult.secure_url;
      }),
    );

    return this.prismaService.watch.create({
      data: {
        ...data,
        slug,
        poster: {
          create: posterUrls.map((url) => ({ url })),
        },
        banner: {
          create: bannerUrls.map((url) => ({ url })),
        },
      },
    });
  }

  async updateWatch(
    id: string,
    data: UpdateWatchDto,
    posterUpdates?: { id: string; file: MulterFile }[],
    bannerUpdates?: { id: string; file: MulterFile }[],
  ) {
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

    if (posterUpdates && posterUpdates.length > 0) {
      await Promise.all(
        posterUpdates.map(async ({ id, file }) => {
          const uploadResult =
            await this.cloudinaryService.uploadImageFromBuffer(
              file.buffer,
              file.originalname,
            );
          const newPosterUrl = uploadResult.secure_url;

          await this.prismaService.poster.update({
            where: { id },
            data: { url: newPosterUrl },
          });
        }),
      );
    }

    if (bannerUpdates && bannerUpdates.length > 0) {
      await Promise.all(
        bannerUpdates.map(async ({ id, file }) => {
          const uploadResult =
            await this.cloudinaryService.uploadImageFromBuffer(
              file.buffer,
              file.originalname,
            );
          const newBannerUrl = uploadResult.secure_url;

          await this.prismaService.banner.update({
            where: { id },
            data: { url: newBannerUrl },
          });
        }),
      );
    }

    const { poster, banner, ...restData } = data as any;

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

    return this.prismaService.watch.delete({
      where: { id },
    });
  }
}
