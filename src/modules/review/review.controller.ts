import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';

import { formatResponse } from 'src/common/helpers/response.helpers';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Public } from '../auth/decorators/public.decorators';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Get all reviews by watch slug (for detail page)' })
  @Public()
  @Get(':slug')
  async getAllReviewsBySlug(@Param('slug') slug: string) {
    const data = await this.reviewService.findAllReviewBySlug(slug);
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
  async create(@Request() req, @Body() dto: CreateReviewDto) {
    const data = await this.reviewService.createReview(req.user.sub, dto);
    return formatResponse(data, 'Review created successfully');
  }

  @ApiOperation({ summary: 'Update your own review' })
  @Patch('update/:id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const data = await this.reviewService.updateReview(req.user.sub, id, dto);
    return formatResponse(data, 'Review updated successfully');
  }

  @ApiOperation({ summary: 'Delete your own review' })
  @Delete('delete/:id')
  async remove(@Request() req, @Param('id') id: string) {
    const data = await this.reviewService.deleteReview(req.user.sub, id);
    return formatResponse(data, 'Review deleted successfully');
  }
}
