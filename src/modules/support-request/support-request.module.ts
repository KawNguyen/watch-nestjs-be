import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SupportRequestController } from './support-request.controller';
import { SupportRequestService } from './support-request.service';

@Module({
  controllers: [SupportRequestController],
  providers: [SupportRequestService, PrismaService, MailService],
})
export class SupportRequestModule {}
