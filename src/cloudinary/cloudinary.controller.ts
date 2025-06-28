import {
  Controller,
  Post,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { formatResponse } from 'src/common/helpers/response.helpers';

@Controller('cloudinary')
@ApiTags('Cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.originalname + '-' + uniqueSuffix);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiQuery({ name: 'width', required: false, type: Number })
  @ApiQuery({ name: 'height', required: false, type: Number })
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('width') width?: string,
    @Query('height') height?: string,
  ) {
    const widthNum = width ? parseInt(width) : undefined;
    const heightNum = height ? parseInt(height) : undefined;

    const data = await this.cloudinaryService.uploadImages(
      files,
      widthNum,
      heightNum,
    );
    return formatResponse(data, 'Images uploaded successfully');
  }

  @Post('upload-single')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.originalname + '-' + uniqueSuffix);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiQuery({ name: 'width', required: false, type: Number })
  @ApiQuery({ name: 'height', required: false, type: Number })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('width') width?: string,
    @Query('height') height?: string,
  ) {
    const widthNum = width ? parseInt(width) : undefined;
    const heightNum = height ? parseInt(height) : undefined;

    const data = await this.cloudinaryService.uploadImage(
      file,
      widthNum,
      heightNum,
    );
    return formatResponse(data, 'Image uploaded successfully');
  }

  @Delete('delete/:publicId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({ status: 200, description: 'Successful deletion' })
  async deleteImage(@Param('publicId') publicId: string) {
    const data = await this.cloudinaryService.deleteImage(publicId);
    return formatResponse(data, 'Image deleted successfully');
  }
}
