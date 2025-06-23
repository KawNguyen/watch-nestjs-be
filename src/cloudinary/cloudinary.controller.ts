import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @Roles(Role.ADMIN)
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
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('width') width?: string,
    @Query('height') height?: string,
  ): Promise<{ data: { public_id: string; secure_url: string }[] }> {
    const widthNum = width ? parseInt(width) : undefined;
    const heightNum = height ? parseInt(height) : undefined;

    const data = await this.cloudinaryService.uploadImages(
      files,
      widthNum,
      heightNum,
    );
    return { data };
  }

  @Post('upload-single')
  @Roles(Role.ADMIN)
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('width') width?: string,
    @Query('height') height?: string,
  ): Promise<{ data: { public_id: string; secure_url: string } }> {
    const widthNum = width ? parseInt(width) : undefined;
    const heightNum = height ? parseInt(height) : undefined;
    const data = await this.cloudinaryService.uploadImage(
      file,
      widthNum,
      heightNum,
    );
    return { data };
  }

  @Delete('delete/:publicId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({ status: 200, description: 'Successful deletion' })
  async deleteImage(@Param('publicId') publicId: string): Promise<void> {
    await this.cloudinaryService.deleteImage(publicId);
  }
}
