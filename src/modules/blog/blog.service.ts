// blog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateBlogDto) {
    return this.prismaService.blog.create({ data: dto });
  }

  async findAll() {
    return this.prismaService.blog.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const blog = await this.prismaService.blog.findFirst({
      where: { id, deletedAt: null },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: string, dto: UpdateBlogDto) {
    await this.findOne(id);
    return this.prismaService.blog.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prismaService.blog.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
