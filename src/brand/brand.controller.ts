import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { Public } from 'src/auth/decorators/public.decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { File as MulterFile } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @ApiOperation({ summary: 'Get all brands' })
  @Public()
  @Get()
  async getAllBrands() {
    return this.brandService.getAllBrands();
  }

  @ApiOperation({ summary: 'Get brand by ID' })
  @Get(':brandId')
  async getBrandById(brandId: string) {
    return this.brandService.getBrandById(brandId);
  }

  @ApiOperation({ summary: 'Create a new brand' })
  @Roles(Role.ADMIN)
  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async createBrand(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) {
      throw new Error('File is required for brand creation');
    }
    console.log('file', file);
    return this.brandService.createBrand(
      createBrandDto,
      file.buffer,
      file.originalname,
    );
  }

  @ApiOperation({ summary: 'Update brand by ID' })
  @Roles(Role.ADMIN)
  @Patch('update/:brandId')
  @UseInterceptors(FileInterceptor('file'))
  async updateBrand(
    @Param('brandId') brandId: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() file?: MulterFile,
  ) {
    console.log('file', file);
    return this.brandService.updateBrand(
      brandId,
      updateBrandDto,
      file.buffer,
      file.originalname
    );
  }

  @ApiOperation({ summary: 'Delete brand by ID' })
  @Roles(Role.ADMIN)
  @Delete('delete/:brandId')
  async deleteBrand(@Param('brandId') brandId: string) {
    return this.brandService.deleteBrand(brandId);
  }
}
