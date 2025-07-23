import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WatchService } from './watch.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CreateWatchDto,
  GetWatchesDto,
  UpdateWatchDto,
  UpdateWatchStatusDto,
} from './dto/watch.dto';

import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from 'src/modules/auth/enums/role.enum';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { Public } from 'src/modules/auth/decorators/public.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Watch')
@Controller('watch')
export class WatchController {
  constructor(private watchService: WatchService) {}

  @ApiOperation({ summary: 'Get all watches (with optional filters)' })
  @Public()
  @Get()
  async getWatches(@Query() query: GetWatchesDto) {
    const data = await this.watchService.getWatches(query);

    return formatResponse(data.items, 'Watches fetched successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.total,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get watch by ID' })
  @Public()
  @Get(':slug')
  async getWatchById(@Param('slug') slug: string) {
    const data = await this.watchService.getWatchBySlug(slug);
    return formatResponse(data, 'Watch fetched successfully');
  }

  @ApiOperation({ summary: 'Create a new watch' })
  @Post('create')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async createWatch(@Body() watchDto: CreateWatchDto) {
    const data = await this.watchService.createWatch(watchDto);
    return formatResponse(data, 'Watch created successfully');
  }

  @ApiOperation({ summary: 'Update a watch' })
  @Patch('update/:watchId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async updateWatch(
    @Param('watchId') watchId: string,
    @Body() watchDto: UpdateWatchDto,
  ) {
    const data = await this.watchService.updateWatch(watchId, watchDto);
    return formatResponse(data, 'Watch updated successfully');
  }

  @ApiOperation({ summary: 'Delete a watch' })
  @Delete('delete/:watchId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async deleteWatch(@Param('watchId') watchId: string) {
    const data = await this.watchService.deleteWatch(watchId);
    return formatResponse(data, 'Watch deleted successfully');
  }

  @ApiOperation({ summary: 'Upload watch status' })
  @Patch('update/:watchId/status')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async updateWatchStatus(
    @Param('watchId') watchId: string,
    @Body() updateWatchStatusDto: UpdateWatchStatusDto,
  ) {
    const data = await this.watchService.updateWatchStatus(
      watchId,
      updateWatchStatusDto,
    );
    return formatResponse(data, 'Update watch status successfully');
  }
}
