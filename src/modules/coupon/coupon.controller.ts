import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { formatResponse } from 'src/common/helpers/response.helpers';
import {
  CreateCouponDto,
  GetALlCoupon,
  UpdateCouponDto,
  ValidateCouponDto,
} from './dto/coupon.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Coupon')
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @ApiOperation({ summary: 'Get all coupons' })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllCoupons(@Query() dto: GetALlCoupon) {
    const data = await this.couponService.getAllCoupons(dto);
    return formatResponse(data.items, 'Fetch all coupons', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get list of coupons user can use' })
  @Get('available')
  @UseGuards(JwtAuthGuard)
  async getListCouponUserCanUse(
    @Req() req: Request,
    @Query('orderValue') orderValue?: number,
  ) {
    const userId = (req as any).user.id;
    const data = await this.couponService.getListCouponUserCanUse(
      userId,
      orderValue,
    );
    return formatResponse(data.coupons, 'Fetch available coupons for user');
  }

  @ApiOperation({ summary: 'Get coupon by code' })
  @Get(':code')
  @UseGuards(JwtAuthGuard)
  async getCouponByCode(@Param('code') code: string) {
    const data = await this.couponService.getCouponByCode(code);
    return formatResponse(data, 'Fetch coupon by code');
  }

  @ApiOperation({ summary: 'Check coupon usage' })
  @Get('check-usage/:couponId')
  @UseGuards(JwtAuthGuard)
  async checkUserCouponUsage(
    @Param('couponId') couponId: string,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    const data = await this.couponService.checkUserCouponUsage(
      userId,
      couponId,
    );
    return formatResponse(data, 'Checked coupon usage successfully');
  }

  @ApiOperation({ summary: 'Check if user can use coupon' })
  @Get('can-use/:code')
  @UseGuards(JwtAuthGuard)
  async canUserUseCoupon(@Param('code') code: string, @Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.couponService.canUserUseCoupon(userId, code);
    return formatResponse(data, 'Checked coupon availability successfully');
  }

  @ApiOperation({ summary: 'Create coupon' })
  @Post('create')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCouponDto) {
    const data = await this.couponService.create(dto);
    return formatResponse(data, 'Create coupon successfully');
  }

  @ApiOperation({ summary: 'Validate coupon' })
  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(@Body() dto: ValidateCouponDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.couponService.validateCouponForOrder(
      userId,
      dto.couponCode,
      dto.orderValue,
    );
    return formatResponse(data, 'Validated coupon successfully');
  }
  
  @ApiOperation({ summary: 'Update coupon' })
  @Patch('update/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const data = await this.couponService.update(id, dto);
    return formatResponse(data, 'Update coupon successfully');
  }

  @ApiOperation({ summary: 'Get all coupons' })
  @Delete('delete/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const data = await this.couponService.remove(id);
    return formatResponse(data, 'Remove coupon successfully');
  }
}
