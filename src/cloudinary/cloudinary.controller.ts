import { Controller, Post, UploadedFile, UseGuards } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { File as MulterFile } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  @Post()
  async uploadFile(@UploadedFile() file: MulterFile) {
    const result = await this.cloudinaryService.uploadImage(file.path);
    return result;
  }
}
