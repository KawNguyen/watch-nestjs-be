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
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { Public } from '../auth/decorators/public.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new blog' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBlogDto) {
    return this.blogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs (excluding soft-deleted ones)' })
  @Public()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get blog details by ID' })
  @Public()
  findOne(@Param('slug') slug: string) {
    return this.blogService.findOne(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog by ID' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a blog by ID' })
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
