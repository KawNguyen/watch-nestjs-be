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
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorators';
import { CreateWatchDto, UpdateWatchDto } from './dto/watch.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the watch' },
        price: { type: 'number', description: 'Price of the watch' },
        gender: {
          type: 'string',
          enum: ['MEN', 'WOMEN', 'UNISEX'],
          description: 'Gender category',
        },
        brandId: { type: 'string', description: 'Brand ID' },
        bandMaterialId: { type: 'string', description: 'Band material ID' },
        movementId: { type: 'string', description: 'Movement ID' },
        materialId: { type: 'string', description: 'Material ID' },
        diameter: { type: 'number', description: 'Diameter of the watch' },
        waterResistance: {
          type: 'number',
          description: 'Water resistance level',
        },
        warranty: { type: 'number', description: 'Warranty period in months' },
        videoUrl: { type: 'string', description: 'Video URL of the watch' },
        description: {
          type: 'string',
          description: 'Detailed description of the watch',
        },
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Poster image file',
        },
        banner: {
          type: 'string',
          format: 'binary',
          description: 'Banner image file',
        },
      },
    },
  })
  async createWatch(
    @Body() watchDto: CreateWatchDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    console.log('Uploaded files:', files);
    if (!files || files.length === 0) {
      throw new Error('Files are required for watch creation');
    }

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
