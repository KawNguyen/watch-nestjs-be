import { Module } from '@nestjs/common';
import { ReturnRequestController } from './return-request.controller';
import { ReturnRequestService } from './return-request.service';

@Module({
  providers: [ReturnRequestService],
  controllers: [ReturnRequestController],
})
export class ReturnRequestModule {}
