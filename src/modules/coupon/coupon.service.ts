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

  async getListCouponUserCanUse(userId: string, orderValue?: number) {
    const now = new Date();

    const allCoupons = await this.prismaService.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { count: null },
          {
            AND: [
              { count: { not: null } },
              { usedCount: { lt: this.prismaService.coupon.fields.count } },
            ],
          },
        ],
      },
      include: {
        couponUsage: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const availableCoupons = allCoupons.filter((coupon) => {
      if (coupon.couponUsage.length > 0) {
        return false;
      }

      if (
        orderValue &&
        coupon.minOrderValue &&
        orderValue < coupon.minOrderValue
      ) {
        return false;
      }

      if (coupon.count && coupon.usedCount >= coupon.count) {
        return false;
      }

      return true;
    });

    const couponsWithDiscount = availableCoupons.map((coupon) => {
      let discountAmount = 0;
      let finalPrice = orderValue || 0;

      if (orderValue) {
        discountAmount = this.calculateDiscount(coupon, orderValue);
        finalPrice = orderValue - discountAmount;
      }

      return {
        ...coupon,
        couponUsage: undefined,
        discountAmount,
        finalPrice: orderValue ? finalPrice : null,
        canUse: true,
        reason: 'Available for use',
      };
    });

    return {
      coupons: couponsWithDiscount,
      totalAvailable: couponsWithDiscount.length,
      orderValue: orderValue || null,
    };
  }

  async getCouponByCode(code: string) {
    return this.prismaService.coupon.findUnique({ where: { code } });
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

  async checkUserCouponUsage(userId: string, couponId: string) {
    const usage = await this.prismaService.couponUsage.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId,
        },
      },
      include: {
        coupon: {
          select: {
            code: true,
            description: true,
          },
        },
      },
    });

    return {
      hasUsed: !!usage,
      usageInfo: usage || null,
    };
  }

  async canUserUseCoupon(userId: string, couponCode: string) {
    const coupon = await this.prismaService.coupon.findUnique({
      where: { code: couponCode },
      include: {
        couponUsage: {
          where: { userId },
        },
      },
    });

    if (!coupon) {
      return {
        canUse: false,
        reason: 'Coupon not found',
        coupon: null,
      };
    }

    if (!coupon.isActive) {
      return {
        canUse: false,
        reason: 'Coupon is not active',
        coupon,
      };
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        canUse: false,
        reason: 'Coupon has expired or not yet valid',
        coupon,
      };
    }

    if (coupon.count && coupon.usedCount >= coupon.count) {
      return {
        canUse: false,
        reason: 'Coupon usage limit exceeded',
        coupon,
      };
    }

    if (coupon.couponUsage.length > 0) {
      return {
        canUse: false,
        reason: 'User has already used this coupon',
        coupon,
      };
    }

    return {
      canUse: true,
      reason: 'Coupon is valid',
      coupon,
    };
  }

  async validateCouponForOrder(
    userId: string,
    couponCode: string,
    orderValue: number,
  ) {
    const validation = await this.canUserUseCoupon(userId, couponCode);

    if (!validation.canUse) {
      return validation;
    }

    const coupon = validation.coupon;

    if (!coupon) {
      return {
        canUse: false,
        reason: 'Coupon not found',
        coupon: null,
      };
    }

    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return {
        canUse: false,
        reason: `Minimum order value required: ${coupon.minOrderValue}`,
        coupon,
      };
    }

    return {
      canUse: true,
      reason: 'Coupon is valid for this order',
      coupon,
      discountAmount: this.calculateDiscount(coupon, orderValue),
    };
  }

  private calculateDiscount(coupon: any, orderValue: number): number {
    if (coupon.discountType === 'PERCENTAGE') {
      return (orderValue * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'FIXED') {
      return Math.min(coupon.discountValue, orderValue);
    }
    return 0;
  }

  async markCouponAsUsed(userId: string, couponId: string) {
    return await this.prismaService.$transaction(async (tx) => {
      const usage = await tx.couponUsage.create({
        data: {
          userId,
          couponId,
        },
      });

      await tx.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
        },
      });

      return usage;
    });
  }
}
