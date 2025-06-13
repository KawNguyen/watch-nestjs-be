import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { formatResponse } from 'src/common/helpers/response.helper';
import {
  AddCartItemDto,
  RemoveCartItemsDto,
  UpdateQuantityDto,
} from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart item by userId' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getCartItemByUserId(@Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.cartService.getCartItemsByUserId(userId, userId);
    return formatResponse(data, 'Fetch cart item successfully');
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
  @Delete('remove')
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
