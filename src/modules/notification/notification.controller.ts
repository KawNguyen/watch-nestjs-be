import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, GetAllDTO } from './dto/notification.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Create a new notification' })
  @Post('create')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationService.create(createNotificationDto);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @Patch('mark-as-read/:id')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req, @Param('id') id: string) {
    const requesterId = req.user.id;
    const res = await this.notificationService.markAsRead(id, requesterId);
    return formatResponse(res, 'Mark notification as read successfully');
  }

  @ApiOperation({ summary: 'Get all notifications for the logged-in user' })
  @Get('my-notifications')
  @UseGuards(JwtAuthGuard)
  async getAll(@Req() req, @Query() query: GetAllDTO) {
    const requesterId = req.user.id;
    const res = await this.notificationService.getAllNotificationsByUserId(
      requesterId,
      query.page,
      query.limit,
    );
    return formatResponse(res.data, 'Fetch all notifications successfully', {
      limit: res.limit,
      page: res.currentPage,
      totalItems: res.total,
      totalPages: res.totalPages,
    });
  }
}
