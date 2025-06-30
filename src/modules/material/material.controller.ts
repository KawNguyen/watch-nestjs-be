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
import { MaterialService } from './material.service';

import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

import { formatResponse } from 'src/common/helpers/response.helpers';
import { Public } from '../auth/decorators/public.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Material')
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @ApiOperation({ summary: 'Get all materials' })
  @Public()
  @Get()
  async getAllMaterials() {
    const data = await this.materialService.getAllMaterials();
    return formatResponse(data, 'Materials fetched successfully');
  }

  @ApiOperation({ summary: 'Get material by ID' })
  @Get(':materialId')
  async getMaterialById(materialId: string) {
    const data = await this.materialService.getMaterialById(materialId);
    return formatResponse(data, 'Material fetched successfully');
  }

  @ApiOperation({ summary: 'Create material' })
  @Roles(Role.ADMIN)
  @Post('create')
  async createMaterial(@Body() createMaterialDto: CreateMaterialDto) {
    const data = await this.materialService.createMaterial(createMaterialDto);
    return formatResponse(data, 'Material created successfully');
  }

  @ApiOperation({ summary: 'Update material' })
  @Roles(Role.ADMIN)
  @Patch('update/:materialId')
  async updateMaterial(
    @Param('materialId') materialId: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    const data = await this.materialService.updateMaterial(
      materialId,
      updateMaterialDto,
    );
    return formatResponse(data, 'Material updated successfully');
  }

  @ApiOperation({ summary: 'Delete material' })
  @Roles(Role.ADMIN)
  @Delete('delete/:materialId')
  async deleteMaterial(@Param('materialId') materialId: string) {
    const data = await this.materialService.deleteMaterial(materialId);
    return formatResponse(data, 'Material deleted successfully');
  }
}
