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
import { formatResponse } from 'src/common/helpers/response.helper';

@ApiTags('Favorite')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiOperation({ summary: 'Get all favorite by userId' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllFavoriteByUserId(@Req() req: Request) {
    const userId = (req as any).user.id;
    const data = await this.favoriteService.getFavoriteME(userId, userId);
    return formatResponse(data, 'Favorites fetched successfully');
  }

  @ApiOperation({ summary: 'Add favorite to your account' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @Body() addFavoriteDto: AddFavoriteDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    const data = await this.favoriteService.addFavorite(addFavoriteDto, userId);
    return formatResponse(data, 'Add favorite successfully');
  }

  @ApiOperation({ summary: 'Remove favorite(s)' })
  @Delete('remove')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: Request, @Body() body: RemoveFavoriteDto) {
    const userId = (req as any).user.id;
    const result = await this.favoriteService.removeFavorites(
      userId,
      body.favoriteIds,
    );
    return formatResponse(result, 'Removed favorite(s) successfully');
  }
}
