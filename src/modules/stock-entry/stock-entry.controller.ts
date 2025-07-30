import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StockEntryService } from './stock-entry.service';

import {
  CreateStockEntryDto,
  GetAllStockEntriesDto,
  GetStockStatisticsDto,
} from './dto/stock-entry.dto';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Stock Entry')
@Controller('stock-entry')
export class StockEntryController {
  constructor(private readonly stockEntryService: StockEntryService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get stock entry statistics' })
  async getStockStatistics(@Query() query: GetStockStatisticsDto) {
    const data = await this.stockEntryService.getStockStatistics(query);
    return formatResponse(data, 'Fetch stock statistics successfully');
  }

  @ApiOperation({ summary: 'Get all stock entry' })
  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getAllStockEntries(@Query() query: GetAllStockEntriesDto) {
    const data = await this.stockEntryService.getAllStockEntries(query);
    return formatResponse(data.items, 'Fetch all stock entries successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get all stock entry' })
  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async getStockEntryByID(@Param('id') id: string) {
    const data = await this.stockEntryService.getStockEntryById(id);
    return formatResponse(data, 'Fetch stock entry by ID successfully');
  }

  @ApiOperation({ summary: 'Add Stock' })
  @Post('add-stock')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async addStockEntry(@Body() dto: CreateStockEntryDto) {
    const data = await this.stockEntryService.createStockEntryV2(dto);
    return formatResponse(data, 'Add stock successfully');
  }
}
