import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReturnRequestService } from './return-request.service';
import { ReturnRequestStatus } from '@prisma/client';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';

@Controller('return-request')
export class ReturnRequestController {
  constructor(private readonly service: ReturnRequestService) {}

  @ApiOperation({ summary: 'Get all return requests' })
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 12 })
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const res = await this.service.findAll({
      page,
      limit,
    });

    return formatResponse(res.items, 'Return requests fetched successfully', {
      page: res.page,
      limit: res.limit,
      totalItems: res.totalItems,
      totalPages: res.totalPages,
    });
  }

  @ApiOperation({ summary: 'Get a return request by ID' })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const res = await this.service.findOne(id);
    return formatResponse(res, 'Return request details fetched successfully');
  }

  @ApiOperation({ summary: 'Create a return request' })
  @Post(`create`)
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateReturnRequestDto, @Req() req: Request) {
    const userId = (req as any).user.id;
    const res = await this.service.create(userId, body);
    return formatResponse(res, 'Return request created successfully');
  }

  @ApiOperation({ summary: 'Update return request status' })
  @Patch('update-status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ReturnRequestStatus,
  ) {
    const res = await this.service.updateStatus(id, status);
    return formatResponse(res, 'Return request status updated successfully');
  }

  @ApiOperation({ summary: 'Soft delete a return request' })
  @Delete('soft-delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async softDelete(@Param('id') id: string) {
    const res = await this.service.softDelete(id);
    return formatResponse(res, 'Return request soft deleted successfully');
  }
}
