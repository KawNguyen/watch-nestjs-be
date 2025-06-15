import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { OrderStatus } from '@prisma/client';
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Get all orders' })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') searchTerm?: string,
    @Query('status') status?: OrderStatus,
    @Query('userId') userId?: string,
  ) {
    const data = await this.orderService.getAllOrders(
      page,
      limit,
      searchTerm,
      status,
      userId,
    );
    return formatResponse(data.data, 'Fetched orders successfully', {
      totalItems: data.totalItems,
      limit: data.limit,
      page: data.page,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get orders by user ID' })
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async getOrdersByUserId(
    @Param('userId') userId: string,
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.orderService.getOrdersByUserId(
      userId,
      requesterId,
      page,
      limit,
    );
    return formatResponse(data.data, 'Fetch orders by user Id successfully', {
      totalItems: data.totalItems,
      limit: data.limit,
      page: data.page,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Create Order' })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrder() {
    
  }
}
