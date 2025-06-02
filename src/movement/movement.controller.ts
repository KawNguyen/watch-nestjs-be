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
import { Public } from 'src/auth/decorators/public.decorators';
import { CreateMovementDto, UpdateMovementDto } from './dto/movement.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Movement')
@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @ApiOperation({ summary: 'Get all movements' })
  @Public()
  @Get()
  getAllMovements() {
    return this.movementService.getAllMovements();
  }

  @ApiOperation({ summary: 'Get movement by ID' })
  @Get(':movementId')
  getMovementById(movementId: string) {
    return this.movementService.getMovementById(movementId);
  }

  @ApiOperation({ summary: 'Create movement' })
  @Roles(Role.ADMIN)
  @Post('create')
  createMovement(@Body() movementDto: CreateMovementDto) {
    return this.movementService.createMovement(movementDto);
  }

  @ApiOperation({ summary: 'Update movement' })
  @Roles(Role.ADMIN)
  @Patch('update/:movementId')
  updateMovement(
    @Param('movementId') movementId: string,
    @Body() movementDto: UpdateMovementDto,
  ) {
    return this.movementService.updateMovement(movementId, movementDto);
  }

  @ApiOperation({ summary: 'Delete movement' })
  @Roles(Role.ADMIN)
  @Delete('delete/:movementId')
  deleteMovement(@Param('movementId') movementId: string) {
    return this.movementService.deleteMovement(movementId);
  }
}
