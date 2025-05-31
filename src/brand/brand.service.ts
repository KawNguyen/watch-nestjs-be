import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { generateSlug } from 'src/utils/slug.util';

@Injectable()
export class BrandService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllBrands() {
    return this.prismaService.brand.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

  async createBrand(
    createBrandDto: CreateBrandDto,
    fileBuffer: Buffer,
    fileName: string,
  ) {
    console.log('Received DTO:', createBrandDto);
    console.log('Received file name:', fileName);

    const existingBrand = await this.prismaService.brand.findUnique({
      where: { name: createBrandDto.name },
    });

    if (existingBrand) {
      throw new BadRequestException('Brand with this name already exists');
    }

    const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
      fileBuffer,
      fileName,
    );
    const logoUrl = uploadResult.secure_url;

    const slug = generateSlug(createBrandDto.name);
    return this.prismaService.brand.create({
      data: {
        ...createBrandDto,
        slug,
        logo: logoUrl,
      },
    });
  }

  async updateBrand(
    brandId: string,
    updateBrandDto: UpdateBrandDto,
    imagePath?: string,
  ) {
    const existingBrand = await this.prismaService.brand.findUnique({
      where: { brandId },
    });

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    let logoUrl = existingBrand.logo;
    if (imagePath) {
      const uploadResult = await this.cloudinaryService.uploadImage(imagePath);
      logoUrl = uploadResult.secure_url;
    }

    const slug = updateBrandDto.name
      ? generateSlug(updateBrandDto.name)
      : existingBrand.slug;

    return this.prismaService.brand.update({
      where: { brandId },
      data: {
        ...updateBrandDto,
        slug,
        logo: logoUrl,
      },
    });
  }

  async deleteBrand(brandId: string) {
    const brand = await this.prismaService.brand.findUnique({
      where: { brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.prismaService.brand.delete({
      where: { brandId },
    });

    return { message: 'Brand deleted successfully' };
  }
}
