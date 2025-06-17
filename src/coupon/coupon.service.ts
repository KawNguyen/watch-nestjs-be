import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetALlCoupon } from './dto/coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllCoupons(dto: GetALlCoupon) {
    return await this.prismaService.coupon.findMany();
  }
}
