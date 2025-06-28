import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto, RemoveFavoriteDto } from './dto/favorite.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('Favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiOperation({ summary: 'Get all favorite by userId' })
  @Get('me-favorite')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @UseGuards(JwtAuthGuard)
  async getAllFavoriteByUserId(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.favoriteService.getFavoriteME(
      requesterId,
      page,
      limit,
    );
    return formatResponse(data, 'Favorites fetched successfully');
  }

  @ApiOperation({ summary: 'Add favorite to your account' })
  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @Body() addFavoriteDto: AddFavoriteDto,
    @Req() req: Request,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.favoriteService.addFavorite(
      addFavoriteDto,
      requesterId,
    );
    return formatResponse(data, 'Add favorite successfully');
  }

  @ApiOperation({ summary: 'Remove favorite(s)' })
  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: Request, @Body() body: RemoveFavoriteDto) {
    const requesterId = (req as any).user.id;
    const result = await this.favoriteService.deleteFavoriteItems(
      requesterId,
      body.favoriteIds,
    );
    return formatResponse(result, 'Removed favorite(s) successfully');
  }
}
