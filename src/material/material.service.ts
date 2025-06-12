import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateSlug } from 'src/utils/slug.util';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

@Injectable()
export class MaterialService {
  constructor(private prismaService: PrismaService) {}

  async getAllMaterials() {
    return this.prismaService.material.findMany();
  }

  async getMaterialById(id: string) {
    const material = await this.prismaService.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async createMaterial(createMaterialDto: CreateMaterialDto) {
    const slug = generateSlug(createMaterialDto.name);
    const existingMaterial = await this.prismaService.material.findUnique({
      where: { slug },
    });

    if (existingMaterial) {
      throw new BadRequestException('Material with this name already exists');
    }
    return this.prismaService.material.create({
      data: { ...createMaterialDto, slug },
    });
  }

  async updateMaterial(id: string, updateMaterialDto: UpdateMaterialDto) {
    const existingMaterial = await this.prismaService.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      throw new NotFoundException('Material not found');
    }

    const slug = updateMaterialDto.name
      ? generateSlug(updateMaterialDto.name)
      : existingMaterial.slug;
    return this.prismaService.material.update({
      where: { id },
      data: { ...updateMaterialDto, slug },
    });
  }

  async deleteMaterial(id: string) {
    const existingMaterial = await this.prismaService.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      throw new NotFoundException('Material not found');
    }

    return this.prismaService.material.delete({
      where: { id },
    });
  }
}
