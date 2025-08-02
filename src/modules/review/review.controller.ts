import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';

import { formatResponse } from 'src/common/helpers/response.helpers';
import {
  CreateReviewDto,
  ReviewQueryDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { Public } from '../auth/decorators/public.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Get all reviews' })
  @Get()
  async getAllReviews(@Query() query: ReviewQueryDto) {
    const data = await this.reviewService.findAllReviews(
      query.page,
      query.limit,
    );
    return formatResponse(data.items, 'Fetch all reviews successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get all reviews by watch slug (for detail page)' })
  @Public()
  @Get(':slug')
  async getAllReviewsBySlug(
    @Param('slug') slug: string,
    @Query() query: ReviewQueryDto,
  ) {
    const data = await this.reviewService.findAllReviewBySlug(
      slug,
      query.page,
      query.limit,
    );
    return formatResponse(
      data.items,
      'Fetch all reviews by slug successfully',
      {
        limit: data.limit,
        page: data.page,
        totalItems: data.totalItems,
        totalPages: data.totalPages,
      },
    );
  }

  @ApiOperation({ summary: 'Create a new review for a watch' })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    const data = await this.reviewService.createReview(req.user.id, dto);
    return formatResponse(data, 'Review created successfully');
  }

  @ApiOperation({ summary: 'Update your own review' })
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const data = await this.reviewService.updateReview(req.user.id, id, dto);
    return formatResponse(data, 'Review updated successfully');
  }

  @ApiOperation({ summary: 'Delete your own review' })
  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    const data = await this.reviewService.deleteReview(req.user.id, id, req.user.role);
    return formatResponse(data, 'Review deleted successfully');
  }
}
