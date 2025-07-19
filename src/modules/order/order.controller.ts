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
  AdminCreateOrderDto,
  CancelOrderDto,
  CreateOrderDto,
  CreateOrderWalkinDto,
  GetOrdersDto,
  GetOrdersUserDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth/optional-jwt-auth.guard';

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
  async getOrdersMe(@Req() req: Request, @Query() query: GetOrdersUserDto) {
    const requesterId = (req as any).user.id;
    const data = await this.orderService.getOrdersMe(requesterId, query);
    return formatResponse(data.data, 'Fetch orders by user Id successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(@Param('id') id: string) {
    const data = await this.orderService.getOrder(id);
    return formatResponse(data, 'Fetched order successfully');
  }

  @ApiOperation({ summary: 'Create Order' })
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrderFromCart(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const userId = (req as any).user.id;

    const data = await this.orderService.createOrderFromCart(userId, dto);
    return formatResponse(data, 'Create order successfully');
  }

  @ApiOperation({ summary: 'Admin: Create order for walkin' })
  @Post('create-walkin')
  async createWalkinOrder(@Body() dto: CreateOrderWalkinDto) {
    const order = await this.orderService.createWalkinOrder(dto);
    return formatResponse(order, 'Admin created walk-in order successfully');
  }

  @ApiOperation({ summary: 'Admin: Create order for guest user (walk-in)' })
  @Post('admin/create-walkin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminCreateWalkinOrder(@Body() dto: AdminCreateOrderDto) {
    const order = await this.orderService.adminCreateWalkinOrder(dto);
    return formatResponse(order, 'Admin created walk-in order successfully');
  }

  @ApiOperation({ summary: 'Update Status Order (ADMIN)' })
  @Patch('update-status/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
