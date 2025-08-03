// blog.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateBlogDto, GetAllBlogsDto, UpdateBlogDto } from './dto/blog.dto';
import { Public } from '../auth/decorators/public.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Get all blogs (with optional filters)' })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'deletedAt', required: false, type: String })
  @Public()
  async findAll(
    @Query('isPublished') isPublished?: string,
    @Query('deletedAt') deletedAt?: string,
  ) {
    const blogs = await this.blogService.findAll({ isPublished, deletedAt });
    return formatResponse(blogs, 'Fetched blogs successfully');
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get blog details by ID' })
  @Public()
  async findOne(@Param('slug') slug: string) {
    const res = await this.blogService.findOne(slug);
    return formatResponse(res, 'Fetched blog successfully');
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new blog' })
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateBlogDto) {
    const res = await this.blogService.create(dto);
    return formatResponse(res, 'Blog created successfully');
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a blog by ID' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    const res = await this.blogService.update(id, dto);
    return formatResponse(res, 'Blog updated successfully');
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Soft delete a blog by ID' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const res = await this.blogService.remove(id);
    return formatResponse(res, 'Blog deleted successfully');
  }
}
