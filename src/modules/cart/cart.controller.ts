import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { formatResponse } from 'src/common/helpers/response.helpers';
import {
  AddCartItemDto,
  RemoveCartItemsDto,
  UpdateQuantityDto,
} from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart item by userId' })
  @Get('me-cart')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(JwtAuthGuard)
  async getCartItemByUserId(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.cartService.getCartItemsMe(
      requesterId,
      page,
      limit,
    );
    return formatResponse(data.items, 'Fetch cart item successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Add cart item' })
  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addToCart(@Req() req: Request, @Body() addCartItemDto: AddCartItemDto) {
    const userId = (req as any).user.id;
    const data = await this.cartService.addToCart(userId, addCartItemDto);
    return formatResponse(data, 'Add cart item successfully');
  }

  @ApiOperation({ summary: 'Update quantity cart item' })
  @Patch('update/:cartItemId')
  @UseGuards(JwtAuthGuard)
  async updateQuantity(
    @Req() req: Request,
    @Param('cartItemId') cartItemId: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const userId = (req as any).user.id;
    const data = await this.cartService.updateQuantityCartItem(
      userId,
      cartItemId,
      updateQuantityDto.quantity,
    );
    return formatResponse(data, 'Update quantity cart item successfully');
  }

  @ApiOperation({ summary: 'Remove one or multiple cart items' })
  @ApiBody({ type: RemoveCartItemsDto })
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async removeCartItems(@Req() req: Request, @Body() dto: RemoveCartItemsDto) {
    const userId = (req as any).user.id;

    const result = await this.cartService.removeCartItems(
      userId,
      dto.cartItemIds,
    );

    return formatResponse(result, 'Cart item(s) removed successfully.');
  }
}
