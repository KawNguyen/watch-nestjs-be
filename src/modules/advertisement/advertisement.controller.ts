import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  CreateAdvertisementDto,
  UpdateAdvertisementDto,
} from './dto/advertisement.dto';
import { AdvertisementService } from './advertisement.service';
import { Public } from '../auth/decorators/public.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';


@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @ApiOperation({ summary: 'Get all advertisements' })
  @Public()
  @Get()
  async findAll() {
    return this.advertisementService.findAll();
  }

  @ApiOperation({ summary: 'Get one advertisement by ID' })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.advertisementService.findOne(id);
  }

  @ApiOperation({ summary: 'Create an advertisement' })
  @Post('create')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateAdvertisementDto) {
    return this.advertisementService.create(dto);
  }

  @ApiOperation({ summary: 'Update an advertisement by ID' })
  @Patch('update/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateAdvertisementDto) {
    return this.advertisementService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an advertisement by ID' })
  @Delete('delete/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.advertisementService.remove(id);
  }
}
