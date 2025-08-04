import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Injectable()
export class SupportRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(data: CreateSupportRequestDto) {
    const supportRequest = await this.prisma.supportRequest.create({
      data: {
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });
    await this.mailService.supportRequestCreated(data.email, supportRequest.id);
    return supportRequest;
  }

  async findAll() {
    return this.prisma.supportRequest.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.supportRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Support request not found');
    return request;
  }

  async respond(id: string, response: string) {
    const request = await this.prisma.supportRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Support request not found');
    const updated = await this.prisma.supportRequest.update({
      where: { id },
      data: {
        response,
        status: 'CHECKED',
        updatedAt: new Date(),
      },
    });
    await this.mailService.supportRequestResponse(request.email, id, response);
    return updated;
  }

  async softDelete(id: string) {
    const request = await this.prisma.supportRequest.findUnique({
      where: { id },
    });
    if (!request || request.deletedAt)
      throw new NotFoundException('Support request not found');
    return this.prisma.supportRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
