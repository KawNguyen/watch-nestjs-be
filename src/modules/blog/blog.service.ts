// blog.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto, GetAllBlogsDto, UpdateBlogDto } from './dto/blog.dto';
import { generateSlug } from 'src/utils/slug.utils';

@Injectable()
export class BlogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateBlogDto) {
    const existingBlog = await this.prismaService.blog.findFirst({
      where: { title: dto.title, deletedAt: null },
    });

    if (existingBlog) {
      throw new ConflictException('Blog with this title already exists');
    }

    const slug = generateSlug(dto.title);

    return this.prismaService.blog.create({
      data: {
        ...dto,
        slug,
      },
    });
  }

  async findAll(filters: { isPublished?: string; deletedAt?: string }) {
    const where: any = {};

    if (filters.isPublished !== undefined) {
      where.isPublished = filters.isPublished === 'true';
    }

    if (filters.deletedAt !== undefined) {
      if (filters.deletedAt === 'null') {
        where.deletedAt = null;
      } else {
        where.deletedAt = { not: null };
      }
    }

    return this.prismaService.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(slug: string) {
    const blog = await this.prismaService.blog.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    const blog = await this.findOne(id);
    return this.prismaService.blog.update({
      where: { id: blog.id },
      data: dto,
    });
  }

  async remove(id: string) {
    const blog = await this.findOne(id);
    return this.prismaService.blog.update({
      where: { id: blog.id },
      data: { deletedAt: new Date() },
    });
  }
}
