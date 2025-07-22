import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateSlug } from 'src/utils/slug.utils';
import {
  CreateBandMaterialDto,
  UpdateBandMaterialDto,
} from './dto/band-material.dto';

@Injectable()
export class BandMaterialService {
  constructor(private prisma: PrismaService) {}

  async getAllBandMaterials() {
    return this.prisma.bandMaterial.findMany();
  }

  async getBandMaterialById(id: string) {
    const bandMaterial = await this.prisma.bandMaterial.findUnique({
      where: { id },
    });

    if (!bandMaterial) {
      throw new NotFoundException('Band material not found');
    }

    return bandMaterial;
  }

  async createBandMaterial(createDto: CreateBandMaterialDto) {
    const existingBandMaterial = await this.prisma.bandMaterial.findFirst({
      where: { name: createDto.name },
    });

    if (existingBandMaterial) {
      throw new BadRequestException('Band material already exists');
    }

    const slug = generateSlug(createDto.name);

    return this.prisma.bandMaterial.create({
      data: { ...createDto, slug },
    });
  }

  async updateBandMaterial(id: string, updateDto: UpdateBandMaterialDto) {
    const existing = await this.prisma.bandMaterial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Band material not found');
    }

    const slug = updateDto.name ? generateSlug(updateDto.name) : existing.slug;

    return this.prisma.bandMaterial.update({
      where: { id },
      data: { ...updateDto, slug },
    });
  }

  async deleteBandMaterial(id: string) {
    const existing = await this.prisma.bandMaterial.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Band material not found');
    }

    return this.prisma.bandMaterial.delete({
      where: { id },
    });
  }
}
