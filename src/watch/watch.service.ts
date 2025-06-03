import { File as MulterFile } from 'multer';

import { generateSlug } from 'src/utils/slug.util';
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWatchDto } from './dto/watch.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class WatchService {
  constructor(
    private readonly prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllWatches() {
    return this.prismaService.watch.findMany();
  }

  async getWatchById(watchId: string) {
    return this.prismaService.watch.findUnique({
      where: { watchId },
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
      throw new ConflictException(
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
    watchId: string,
    data: CreateWatchDto,
    posterUpdates?: { posterId: string; file: MulterFile }[],
    bannerUpdates?: { bannerId: string; file: MulterFile }[],
  ) {
    const existingWatch = await this.prismaService.watch.findUnique({
      where: { watchId },
      include: {
        poster: true,
        banner: true,
      },
    });

    if (!existingWatch) {
      throw new ConflictException(`Watch with ID "${watchId}" does not exist`);
    }

    const slug = generateSlug(data.name || existingWatch.name);

    if (posterUpdates && posterUpdates.length > 0) {
      await Promise.all(
        posterUpdates.map(async ({ posterId, file }) => {
          const uploadResult =
            await this.cloudinaryService.uploadImageFromBuffer(
              file.buffer,
              file.originalname,
            );
          const newPosterUrl = uploadResult.secure_url;

          await this.prismaService.poster.update({
            where: { posterId },
            data: { url: newPosterUrl },
          });
        }),
      );
    }

    if (bannerUpdates && bannerUpdates.length > 0) {
      await Promise.all(
        bannerUpdates.map(async ({ bannerId, file }) => {
          const uploadResult =
            await this.cloudinaryService.uploadImageFromBuffer(
              file.buffer,
              file.originalname,
            );
          const newBannerUrl = uploadResult.secure_url;

          await this.prismaService.banner.update({
            where: { bannerId },
            data: { url: newBannerUrl },
          });
        }),
      );
    }

    const { poster, banner, ...restData } = data as any;

    return this.prismaService.watch.update({
      where: { watchId },
      data: {
        ...restData,
        slug,
      },
    });
  }

  async deleteWatch(watchId: string) {
    const existingWatch = await this.prismaService.watch.findUnique({
      where: { watchId },
    });

    if (!existingWatch) {
      throw new ConflictException(`Watch with ID "${watchId}" does not exist`);
    }

    return this.prismaService.watch.delete({
      where: { watchId },
    });
  }
}
