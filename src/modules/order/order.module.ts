import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationService } from '../notification/notification.service';

@Module({
  providers: [OrderService, NotificationService],
  controllers: [OrderController],
})
export class OrderModule {}
