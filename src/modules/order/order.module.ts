import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MailService } from '../mail/mail.service';
import { CouponService } from '../coupon/coupon.service';

@Module({
  providers: [OrderService, MailService, CouponService],
  controllers: [OrderController],
})
export class OrderModule {}
