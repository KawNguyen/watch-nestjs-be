import {
  CreateBandMaterialDto,
  UpdateBandMaterialDto,
} from 'src/band-material/dto/band-material.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateSlug } from 'src/utils/slug.util';

@Injectable()
export class BandMaterialService {
  constructor(private prisma: PrismaService) {}

  async getAllBandMaterials() {
    return this.prisma.bandMaterial.findMany();
  }

  async getBandMaterialById(bandMaterialId: string) {
    const bandMaterial = await this.prisma.bandMaterial.findUnique({
      where: { bandMaterialId },
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

  async updateBandMaterial(
    bandMaterialId: string,
    updateDto: UpdateBandMaterialDto,
  ) {
    const existing = await this.prisma.bandMaterial.findUnique({
      where: { bandMaterialId },
    });

    if (!existing) {
      throw new NotFoundException('Band material not found');
    }

    const slug = updateDto.name ? generateSlug(updateDto.name) : existing.slug;

    return this.prisma.bandMaterial.update({
      where: { bandMaterialId },
      data: { ...updateDto, slug },
    });
  }

  async deleteBandMaterial(bandMaterialId: string) {
    const existing = await this.prisma.bandMaterial.findUnique({
      where: { bandMaterialId },
    });

    if (!existing) {
      throw new NotFoundException('Band material not found');
    }

    return this.prisma.bandMaterial.delete({
      where: { bandMaterialId },
    });
  }
}
