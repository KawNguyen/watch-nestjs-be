import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { generateSlug } from 'src/utils/slug.utils';

@Injectable()
export class BrandService {
  constructor(private prismaService: PrismaService) {}

  async getAllBrands() {
    return this.prismaService.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBrandById(id: string) {
    const brand = await this.prismaService.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async createBrand(createBrandDto: CreateBrandDto) {
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { name: createBrandDto.name },
    });

    if (existingBrand) {
      throw new BadRequestException('Brand with this name already exists');
    }

    const slug = generateSlug(createBrandDto.name);
    return this.prismaService.brand.create({
      data: {
        ...createBrandDto,
        slug,
      },
    });
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto) {
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    const slug = updateBrandDto.name
      ? generateSlug(updateBrandDto.name)
      : existingBrand.slug;

    const logoUrl =
      updateBrandDto.logo && updateBrandDto.logo.trim() !== ''
        ? updateBrandDto.logo
        : existingBrand.logo;

    return this.prismaService.brand.update({
      where: { id },
      data: {
        ...updateBrandDto,
        slug,
        logo: logoUrl,
      },
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prismaService.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.prismaService.brand.delete({
      where: { id },
    });

    return { message: 'Brand deleted successfully' };
  }
}
