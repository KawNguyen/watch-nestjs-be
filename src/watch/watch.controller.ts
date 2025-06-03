import { File as MulterFile } from 'multer';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { WatchService } from './watch.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorators';
import { CreateWatchDto } from './dto/watch.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Watch')
@Controller('watch')
export class WatchController {
  constructor(private watchService: WatchService) {}

  @ApiOperation({ summary: 'Get all watches' })
  @Public()
  @Get()
  async getAllWatches() {
    return this.watchService.getAllWatches();
  }

  @ApiOperation({ summary: 'Get watch by ID' })
  @Public()
  @Get(':watchId')
  async getWatchById(@Param('watchId') watchId: string) {
    return this.watchService.getWatchById(watchId);
  }

  @ApiOperation({ summary: 'Create a new watch' })
  @Post('create')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('files'))
  async createWatch(
    @Body() data: CreateWatchDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    const posterFiles = files.filter((f) => f.fieldname === 'poster');
    const bannerFiles = files.filter((f) => f.fieldname === 'banner');

    return this.watchService.createWatch(data, posterFiles, bannerFiles);
  }
}
