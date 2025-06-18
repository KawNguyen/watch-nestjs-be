import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { formatResponse } from 'src/common/helpers/response.helpers';
import {
  CreateCouponDto,
  GetALlCoupon,
  UpdateCouponDto,
} from './dto/coupon.dto';

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

  @ApiOperation({ summary: 'Create coupon' })
  @Post('create')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCouponDto) {
    const data = await this.couponService.create(dto);
    return formatResponse(data, 'Create coupon successfully');
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
