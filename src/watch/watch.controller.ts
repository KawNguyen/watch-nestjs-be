import { File as MulterFile } from 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { WatchService } from './watch.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorators';
import { CreateWatchDto, GetWatchesDto, UpdateWatchDto } from './dto/watch.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('Watch')
@Controller('watch')
export class WatchController {
  constructor(private watchService: WatchService) {}

  @ApiOperation({ summary: 'Get all watches (with optional filters)' })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: ['MEN', 'WOMEN', 'UNISEX'],
  })
  @ApiQuery({ name: 'brandSlug', required: false, type: String })
  @ApiQuery({ name: 'materialSlug', required: false, type: String })
  @ApiQuery({ name: 'bandMaterialSlug', required: false, type: String })
  @ApiQuery({ name: 'movementSlug', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @Public()
  @Get()
  async getWatches(@Query() query: GetWatchesDto) {
    const data = await this.watchService.getWatches(query);

    return formatResponse(data.data, 'Watches fetched successfully', {
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
        // poster: {
        //   type: 'string',
        //   format: 'binary',
        //   description: 'Poster image file',
        // },
        // banner: {
        //   type: 'string',
        //   format: 'binary',
        //   description: 'Banner image file',
        // },
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

    // const posterFiles = files.filter((f) => f.fieldname === 'poster');
    // const bannerFiles = files.filter((f) => f.fieldname === 'banner');

    const data = await this.watchService.createWatch(
      watchDto,
      // posterFiles,
      // bannerFiles,
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
  @Delete('delete/:watchId')
  @Roles(Role.ADMIN)
  async deleteWatch(@Param('watchId') watchId: string) {
    const data = await this.watchService.deleteWatch(watchId);
    return formatResponse(data, 'Watch deleted successfully');
  }
}
