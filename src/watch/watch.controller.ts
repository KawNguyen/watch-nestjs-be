import { File as MulterFile } from 'multer';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { WatchService } from './watch.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorators';
import { CreateWatchDto, UpdateWatchDto } from './dto/watch.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { formatResponse } from 'src/common/helpers/response.helper';

@ApiTags('Watch')
@Controller('watch')
export class WatchController {
  constructor(private watchService: WatchService) {}

  @ApiOperation({ summary: 'Get all watches' })
  @Public()
  @Get()
  async getAllWatches() {
    const data = await this.watchService.getAllWatches();
    return formatResponse(data, 'Watches fetched successfully');
  }

  @ApiOperation({ summary: 'Get watch by ID' })
  @Public()
  @Get(':watchId')
  async getWatchById(@Param('watchId') watchId: string) {
    const data = await this.watchService.getWatchById(watchId);
    return formatResponse(data, 'Watch fetched successfully');
  }

  @ApiOperation({ summary: 'Create a new watch' })
  @Post('create')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('files'))
  async createWatch(
    @Body() watchDto: CreateWatchDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    const posterFiles = files.filter((f) => f.fieldname === 'poster');
    const bannerFiles = files.filter((f) => f.fieldname === 'banner');

    const data = await this.watchService.createWatch(
      watchDto,
      posterFiles,
      bannerFiles,
    );
    return formatResponse(data, 'Watch created successfully');
  }

  @ApiOperation({ summary: 'Update a watch' })
  @Patch('update/:watchId')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('files'))
  async updateWatch(
    @Param('watchId') watchId: string,
    @Body() watchDto: UpdateWatchDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    const posterFiles = files.filter((f) => f.fieldname === 'poster');
    const bannerFiles = files.filter((f) => f.fieldname === 'banner');

    const data = await this.watchService.updateWatch(
      watchId,
      watchDto,
      posterFiles,
      bannerFiles,
    );
    return formatResponse(data, 'Watch updated successfully');
  }
  @ApiOperation({ summary: 'Delete a watch' })
  @Patch('delete/:watchId')
  @Roles(Role.ADMIN)
  async deleteWatch(@Param('watchId') watchId: string) {
    const data = await this.watchService.deleteWatch(watchId);
    return formatResponse(data, 'Watch deleted successfully');
  }
}
