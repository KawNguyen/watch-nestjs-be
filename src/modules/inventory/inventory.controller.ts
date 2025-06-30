import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetInventoryDto } from './dto/inventory.dto';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: 'Get all inventory' })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() dto: GetInventoryDto) {
    const data = await this.inventoryService.findAll(dto);
    return formatResponse(data.items, 'Fetch inventory successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }
}
