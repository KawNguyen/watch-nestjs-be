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

@ApiTags('Band Material')
@Controller('band-material')
export class BandMaterialController {
  constructor(private readonly bandMaterial: BandMaterialService) {}

  @Public()
  @ApiOperation({ summary: 'Get all band materials' })
  @Get()
  getAllBandMaterials() {
    return this.bandMaterial.getAllBandMaterials();
  }

  @ApiOperation({ summary: 'Get band material by ID' })
  @Get(':bandMaterialId')
  getBandMaterialById(bandMaterialId: string) {
    return this.bandMaterial.getBandMaterialById(bandMaterialId);
  }

  @ApiOperation({ summary: 'Update band materials by ID' })
  @Roles(Role.ADMIN)
  @Post('create')
  createBandMaterialDto(@Body() createBandMaterialDto: CreateBandMaterialDto) {
    return this.bandMaterial.createBandMaterial(createBandMaterialDto);
  }

  @ApiOperation({ summary: 'Update band materials by ID' })
  @Roles(Role.ADMIN)
  @Patch('update/:bandMaterialId')
  updateBandMaterialById(
    @Param('bandMaterialId')
    bandMaterialId: string,
    @Body()
    updateBandMaterialDto: UpdateBandMaterialDto,
  ) {
    return this.bandMaterial.updateBandMaterial(
      bandMaterialId,
      updateBandMaterialDto,
    );
  }

  @ApiOperation({ summary: 'Delete band materials by ID' })
  @Roles(Role.ADMIN)
  @Delete('delete/:bandMaterialId')
  deleteBandMaterialById(@Param("brandMaterialId") bandMaterialId: string) {
    return this.bandMaterial.deleteBandMaterial(bandMaterialId);
  }
}
