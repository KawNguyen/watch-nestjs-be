import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { formatResponse } from 'src/common/helpers/response.helpers';
import {
  CancelOrderDto,
  CreateOrderDto,
  GetOrdersDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Get all orders' })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllOrders(@Query() query: GetOrdersDto) {
    const data = await this.orderService.getAllOrders(query);
    return formatResponse(data.items, 'Fetched orders successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get orders of account' })
  @Get('my-order')
  @UseGuards(JwtAuthGuard)
  async getOrdersMe(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.orderService.getOrdersMe(
      requesterId,
      status,
      page,
      limit,
    );
    return formatResponse(data.data, 'Fetch orders by user Id successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Create Order' })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.orderService.createOrderFromCart(userId, dto);
    return formatResponse(data, 'Create order successfully');
  }

  @ApiOperation({ summary: 'Update Status Order (ADMIN)' })
  @Roles(Role.ADMIN)
  @Patch('update-status/:orderId')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.orderService.updateOrderStatus(
      orderId,
      updateOrderStatusDto,
    );
    return formatResponse(data, 'Update status order successfully');
  }

  @ApiOperation({ summary: 'Cancel Order' })
  @Patch('cancel/:orderId')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Req() req: Request,
    @Body() dto: CancelOrderDto,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.orderService.cancelOrder(orderId, requesterId, dto);
    return formatResponse(data.message);
  }

  @Patch('/admin/cancel/:orderId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async cancelOrderAsAdmin(
    @Param('orderId') id: string,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.orderService.cancelOrderAsAdmin(id, cancelDto);
  }
}
