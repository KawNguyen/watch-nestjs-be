import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateSlug } from 'src/utils/slug.util';

@Injectable()
export class BrandService {
  constructor(private prismaService: PrismaService) {}

  async createBrand(createBrandDto: CreateBrandDto) {
    const slug = generateSlug(createBrandDto.name);
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { slug },
    });

    if (existingBrand) {
      throw new BadRequestException('Brand with this name already exists');
    }

    return this.prismaService.brand.create({
      data: {
        ...createBrandDto,
        slug,
      },
    });
  }

  async getAllBrands() {
    return this.prismaService.brand.findMany();
  }

  async getBrandById(brandId: string) {
    const brand = await this.prismaService.brand.findUnique({
      where: { brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async updateBrand(brandId: string, updateBrandDto: UpdateBrandDto) {
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { brandId },
    });

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    const slug = updateBrandDto.name
      ? generateSlug(updateBrandDto.name)
      : existingBrand.slug;
    return this.prismaService.brand.update({
      where: { brandId },
      data: {
        ...updateBrandDto,
        slug,
      },
    });
  }

  async deleteBrand(brandId: string) {
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { brandId },
    });

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    return this.prismaService.brand.delete({
      where: { brandId },
    });
  }
}
