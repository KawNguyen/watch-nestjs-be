import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SupportRequestService } from './support-request.service';
import { ApiOperation } from '@nestjs/swagger';
import { RespondSupportRequestDto } from './dto/respond-support-request.dto';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Controller('support-request')
export class SupportRequestController {
  constructor(private readonly service: SupportRequestService) {}

  @ApiOperation({
    summary: 'Get all support requests',
    description: 'Retrieves a list of all support requests.',
  })
  @Get()
  async findAll() {
    const res = await this.service.findAll();
    return formatResponse(res, 'Support requests retrieved successfully');
  }

  @ApiOperation({
    summary: 'Get a specific support request by ID',
    description: 'Retrieves a support request by its unique identifier.',
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const res = await this.service.findOne(id);
    return formatResponse(res, 'Support request retrieved successfully');
  }

  @ApiOperation({
    summary: 'Create a new support request',
    description: 'Creates a new support request with the provided details.',
  })
  @Post('create')
  async create(@Body() body: CreateSupportRequestDto) {
    const res = await this.service.create(body);
    return formatResponse(res, 'Support request created successfully');
  }

  @ApiOperation({
    summary: 'Respond to a support request',
    description: 'Updates the support request with a response and status.',
  })
  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard)
  async respond(
    @Param('id') id: string,
    @Body() body: RespondSupportRequestDto,
  ) {
    const res = await this.service.respond(id, body.response);
    return formatResponse(res, 'Support request responded successfully');
  }

  @ApiOperation({
    summary: 'Soft delete a support request',
    description:
      'Marks a support request as deleted without removing it from the database.',
  })
  @Delete('soft-delete/:id')
  @UseGuards(JwtAuthGuard)
  async softDelete(@Param('id') id: string) {
    const res = await this.service.softDelete(id);
    return formatResponse(res, 'Support request deleted successfully');
  }
}
