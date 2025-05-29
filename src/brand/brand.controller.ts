import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { Public } from 'src/auth/decorators/public.decorators';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Brand')
@Controller('brands')
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
  async createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.createBrand(createBrandDto);
  }

  @ApiOperation({ summary: 'Update brand by ID' })
  @Roles(Role.ADMIN)
  @Patch('update/:brandId')
  async updateBrand(
    @Param('brandId')
    brandId: string,
    @Body()
    updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.updateBrand(brandId, updateBrandDto);
  }

  @ApiOperation({ summary: 'Delete brand by ID' })
  @Roles(Role.ADMIN)
  @Delete('delete/:brandId')
  async deleteBrand(@Param('brandId') brandId: string) {
    return this.brandService.deleteBrand(brandId);
  }
}
