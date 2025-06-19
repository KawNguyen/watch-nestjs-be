import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
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
import { formatResponse } from 'src/common/helpers/response.helpers';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Brand')
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @ApiOperation({ summary: 'Get all brands' })
  @Public()
  @Get()
  async getAllBrands() {
    const data = await this.brandService.getAllBrands();
    return formatResponse(data, 'Brands fetched successfully');
  }

  @ApiOperation({ summary: 'Get brand by ID' })
  @Get(':brandId')
  async getBrandById(@Param('brandId') brandId: string) {
    const data = await this.brandService.getBrandById(brandId);
    return formatResponse(data, 'Brand fetched successfully');
  }

  @ApiOperation({ summary: 'Create a new brand' })
  @Roles(Role.ADMIN)
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createBrand(@Body() createBrandDto: CreateBrandDto) {
    const data = await this.brandService.createBrand(createBrandDto);
    return formatResponse(data, 'Create brand successfully');
  }

  @ApiOperation({ summary: 'Update brand by ID' })
  @Roles(Role.ADMIN)
  @Patch('update/:brandId')
  @UseGuards(JwtAuthGuard)
  async updateBrand(
    @Param('brandId') brandId: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    const data = this.brandService.updateBrand(brandId, updateBrandDto);
    return formatResponse(data, 'Brand updated successfully');
  }

  @ApiOperation({ summary: 'Delete brand by ID' })
  @Roles(Role.ADMIN)
  @Delete('delete/:brandId')
  async deleteBrand(@Param('brandId') brandId: string) {
    const data = await this.brandService.getBrandById(brandId);
    return formatResponse(data, 'Brand deleted successfully');
  }
}
