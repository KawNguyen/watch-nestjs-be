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

    if (!createBrandDto.image || !createBrandDto.image.absolute_url) {
      throw new BadRequestException('Image URL is required');
    }

    const slug = generateSlug(createBrandDto.name);

    return this.prismaService.brand.create({
      data: {
        ...createBrandDto,
        image: {
          absolute_url: createBrandDto.image.absolute_url,
          public_id: createBrandDto.image.public_id,
        },
        slug,
      },
    });
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto) {
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { id },
    });

    console.log(updateBrandDto);

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    const slug = updateBrandDto.name
      ? generateSlug(updateBrandDto.name)
      : existingBrand.slug;

    if (updateBrandDto.name) {
      const brandWithSameName = await this.prismaService.brand.findFirst({
        where: { name: updateBrandDto.name, NOT: { id } },
      });
      if (brandWithSameName) {
        throw new BadRequestException('Brand with this name already exists');
      }
    }

    return this.prismaService.brand.update({
      where: { id },
      data: {
        ...updateBrandDto,
        slug,
        image: {
          update: {
            absolute_url: updateBrandDto.image?.absolute_url,
            public_id: updateBrandDto.image?.public_id,
          },
        },
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

    return await this.prismaService.brand.delete({
      where: { id },
    });
  }
}
