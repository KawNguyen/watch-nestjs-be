import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { generateSlug } from 'src/utils/slug.util';
import { extractPublicIdFromUrl } from 'src/utils/extract-public-id.util';

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

  async getBrandById(id: string) {
    const brand = await this.prismaService.brand.findUnique({
      where: { id },
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
    id: string,
    updateBrandDto: UpdateBrandDto,
    fileBuffer?: Buffer,
    fileName?: string,
  ) {
    console.log(
      'Received file buffer and name for update',
      fileBuffer,
      fileName,
    );

    const existingBrand = await this.prismaService.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    let logoUrl = existingBrand.logo;

    if (fileBuffer && fileName) {
      if (existingBrand.logo) {
        const publicId = extractPublicIdFromUrl(existingBrand.logo);
        await this.cloudinaryService.deleteImage(publicId);
      }

      const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
        fileBuffer,
        fileName,
      );
      logoUrl = uploadResult.secure_url;
    }

    const slug = updateBrandDto.name
      ? generateSlug(updateBrandDto.name)
      : existingBrand.slug;

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

    if (brand.logo) {
      const publicId = extractPublicIdFromUrl(brand.logo);
      await this.cloudinaryService.deleteImage(publicId);
    }

    await this.prismaService.brand.delete({
      where: { id },
    });

    return { message: 'Brand deleted successfully' };
  }
}
