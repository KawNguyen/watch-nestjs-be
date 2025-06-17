import { Controller, Get, UseGuards } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { GetALlCoupon } from './dto/coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiOperation({ summary: 'Get all coupons' })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllCoupons(dto: GetALlCoupon) {
    const data = await this.couponService.getAllCoupons(dto);
    return formatResponse(data, 'Fetch all coupons');
  }
}
