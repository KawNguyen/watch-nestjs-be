import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('create')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const data = await this.notificationService.create(createNotificationDto);
  }

  @Get(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Get(':userId')
  getAll(@Param('userId') userId: string) {
    return this.notificationService.getAllNotificationsByUserId(userId);
  }
}
