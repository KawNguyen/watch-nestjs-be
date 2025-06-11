import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BandMaterialService } from './band-material.service';
import { Public } from 'src/auth/decorators/public.decorators';
import {
  CreateBandMaterialDto,
  UpdateBandMaterialDto,
} from './dto/band-material.dto';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { formatResponse } from 'src/common/helpers/response.helper';

@ApiTags('Band Material')
@Controller('band-material')
export class BandMaterialController {
  constructor(private readonly bandMaterial: BandMaterialService) {}

  @Public()
  @ApiOperation({ summary: 'Get all band materials' })
  @Get()
  async getAllBandMaterials() {
    const data = await this.bandMaterial.getAllBandMaterials();
    return formatResponse(data, 'Band materials fetched successfully');
  }

  @ApiOperation({ summary: 'Get band material by ID' })
  @Get(':bandMaterialId')
  async getBandMaterialById(bandMaterialId: string) {
    const data = await this.bandMaterial.getBandMaterialById(bandMaterialId);
    return formatResponse(data, 'Band material fetched successfully');
  }

  @ApiOperation({ summary: 'Update band materials by ID' })
  @Roles(Role.ADMIN)
  @Post('create')
  async createBandMaterialDto(@Body() createBandMaterialDto: CreateBandMaterialDto) {
    const data = await this.bandMaterial.createBandMaterial(createBandMaterialDto);
    return formatResponse(data, 'Band material created successfully');
  }

  @ApiOperation({ summary: 'Update band materials by ID' })
  @Roles(Role.ADMIN)
  @Patch('update/:bandMaterialId')
  async updateBandMaterialById(
    @Param('bandMaterialId')
    bandMaterialId: string,
    @Body()
    updateBandMaterialDto: UpdateBandMaterialDto,
  ) {
    const data = await this.bandMaterial.updateBandMaterial(
      bandMaterialId,
      updateBandMaterialDto,
    );
    return formatResponse(data, 'Band material updated successfully');
  }

  @ApiOperation({ summary: 'Delete band materials by ID' })
  @Roles(Role.ADMIN)
  @Delete('delete/:bandMaterialId')
  async deleteBandMaterialById(@Param("brandMaterialId") bandMaterialId: string) {
    const data = await this.bandMaterial.deleteBandMaterial(bandMaterialId);
    return formatResponse(data, 'Band material deleted successfully');
  }
}
