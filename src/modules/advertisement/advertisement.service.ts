import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
} from './dto/advertisement.dto';

@Injectable()
export class AdvertisementService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateAdvertisementDto) {
    return this.prismaService.advertisement.create({ data: dto });
  }

  async findAll() {
    return this.prismaService.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ad = await this.prismaService.advertisement.findUnique({
      where: { id },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');
    return ad;
  }

  async update(id: string, dto: UpdateAdvertisementDto) {
    await this.findOne(id);
    return this.prismaService.advertisement.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prismaService.advertisement.delete({ where: { id } });
  }
}
