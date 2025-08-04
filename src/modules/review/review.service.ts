import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllReviews(page = 1, limit = 12) {
    const [totalItems, items] = await this.prismaService.$transaction([
      this.prismaService.review.count(),
      this.prismaService.review.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      items,
    };
  }

  async findAllReviewBySlug(slug: string, page = 1, limit = 12) {
    const [totalItems, items] = await this.prismaService.$transaction([
      this.prismaService.review.count({
        where: {
          watch: { slug },
        },
      }),
      this.prismaService.review.findMany({
        where: {
          watch: { slug },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      items,
    };
  }

  async createReview(requesterId: string, createReviewDto: CreateReviewDto) {
    if (!requesterId) {
      throw new ForbiddenException('You must be logged in to create a review.');
    }

    const existingReview = await this.prismaService.review.findFirst({
      where: {
        userId: requesterId,
        watchId: createReviewDto.watchId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this watch.');
    }

    return await this.prismaService.review.create({
      data: {
        ...createReviewDto,
        userId: requesterId,
      },
    });
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this review.',
      );
    }

    return this.prismaService.review.update({
      where: { id: reviewId },
      data: dto,
    });
  }

  async deleteReview(userId: string, reviewId: string, isAdmin: string) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    if (review.userId !== userId && isAdmin !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this review.',
      );
    }

    return this.prismaService.review.delete({
      where: { id: reviewId },
    });
  }
}
