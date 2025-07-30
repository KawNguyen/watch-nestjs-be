import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MailService } from '../mail/mail.service';

@Module({
  providers: [OrderService, MailService],
  controllers: [OrderController],
})
export class OrderModule {}
