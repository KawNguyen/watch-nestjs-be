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
import { Public } from 'src/auth/decorators/public.decorators';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Material')
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @ApiOperation({ summary: 'Get all materials' })
  @Public()
  @Get()
  getAllMaterials() {
    return this.materialService.getAllMaterials();
  }

  @ApiOperation({ summary: 'Get material by ID' })
  @Get(':materialId') 
  getMaterialById(materialId: string) {
    return this.materialService.getMaterialById(materialId);
  }

  @ApiOperation({ summary: 'Create material' })
  @Roles(Role.ADMIN)
  @Post('create')
  createMaterial(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialService.createMaterial(createMaterialDto);
  }

  @ApiOperation({ summary: 'Update material' })
  @Roles(Role.ADMIN)
  @Patch('update/:materialId')
  updateMaterial(
    @Param('materialId') materialId: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialService.updateMaterial(materialId, updateMaterialDto);
  }

  @ApiOperation({ summary: 'Delete material' })
  @Roles(Role.ADMIN)
  @Delete('delete/:materialId')
  deleteMaterial(@Param('materialId') materialId: string) {
    return this.materialService.deleteMaterial(materialId);
  }
}
