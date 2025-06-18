import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCouponDto,
  GetALlCoupon,
  UpdateCouponDto,
} from './dto/coupon.dto';
import { generateRandomCode } from 'src/utils/generate-coupon.utils';

@Injectable()
export class CouponService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllCoupons(dto: GetALlCoupon) {
    const { page = 1, limit = 10 } = dto;

    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.coupon.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.coupon.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      totalItems,
      totalPages,
      page: page,
      limit,
    };
  }

  async create(data: CreateCouponDto) {
    let code = data.code;

    if (!code) {
      let isUnique = false;

      while (!isUnique) {
        const generated = generateRandomCode();
        const exists = await this.prismaService.coupon.findUnique({
          where: { code: generated },
        });

        if (!exists) {
          code = generated;
          isUnique = true;
        }
      }
    }

    return this.prismaService.coupon.create({
      data: {
        ...data,
        code,
      },
    });
  }

  async update(id: string, data: UpdateCouponDto) {
    return this.prismaService.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prismaService.coupon.delete({ where: { id } });
  }
}
