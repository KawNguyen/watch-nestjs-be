// blog.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog' })
  create(@Body() dto: CreateBlogDto) {
    return this.blogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs (excluding soft-deleted ones)' })
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog details by ID' })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a blog by ID' })
  @ApiResponse({ status: 200, description: 'Successfully deleted' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
