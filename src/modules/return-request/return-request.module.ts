import { Module } from '@nestjs/common';
import { ReturnRequestController } from './return-request.controller';
import { ReturnRequestService } from './return-request.service';
import { MailService } from '../mail/mail.service';

@Module({
  providers: [ReturnRequestService, MailService],
  controllers: [ReturnRequestController],
})
export class ReturnRequestModule {}
