import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoriteService } from './favorite.service';
import { AddFavoriteDto, RemoveFavoriteDto } from './dto/favorite.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('Favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiOperation({ summary: 'Get all favorite by userId' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getAllFavoriteByUserId(@Req() req: Request) {
    const requesterId = (req as any).user.id;
    const data = await this.favoriteService.getFavoriteME(requesterId);
    return formatResponse(data, 'Favorites fetched successfully');
  }

  @ApiOperation({ summary: 'Add favorite to your account' })
  @Post('/add')
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
  @Delete('remove')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: Request, @Body() body: RemoveFavoriteDto) {
    const requesterId = (req as any).user.id;
    const result = await this.favoriteService.removeFavorites(
      requesterId,
      body.favoriteIds,
    );
    return formatResponse(result, 'Removed favorite(s) successfully');
  }
}
