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
import { MovementService } from './movement.service';
import { CreateMovementDto, UpdateMovementDto } from './dto/movement.dto';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { Public } from '../auth/decorators/public.decorators';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('Movement')
@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @ApiOperation({ summary: 'Get all movements' })
  @Public()
  @Get()
  async getAllMovements() {
    const data = await this.movementService.getAllMovements();
    return formatResponse(data, 'Movements fetched successfully');
  }

  @ApiOperation({ summary: 'Get movement by ID' })
  @Get(':movementId')
  async getMovementById(movementId: string) {
    const data = await this.movementService.getMovementById(movementId);
    return formatResponse(data, 'Movement fetched successfully');
  }

  @ApiOperation({ summary: 'Create movement' })
  @Roles(Role.ADMIN)
  @Post('create')
  async createMovement(@Body() movementDto: CreateMovementDto) {
    const data = await this.movementService.createMovement(movementDto);
    return formatResponse(data, 'Movement created successfully');
  }

  @ApiOperation({ summary: 'Update movement' })
  @Roles(Role.ADMIN)
  @Patch('update/:movementId')
  async updateMovement(
    @Param('movementId') movementId: string,
    @Body() movementDto: UpdateMovementDto,
  ) {
    const data = await this.movementService.updateMovement(
      movementId,
      movementDto,
    );
    return formatResponse(data, 'Movement updated successfully');
  }

  @ApiOperation({ summary: 'Delete movement' })
  @Roles(Role.ADMIN)
  @Delete('delete/:movementId')
  async deleteMovement(@Param('movementId') movementId: string) {
    const data = await this.movementService.deleteMovement(movementId);
    return formatResponse(data, 'Movement deleted successfully');
  }
}
