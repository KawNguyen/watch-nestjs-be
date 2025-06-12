import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all user' })
  @Roles(Role.ADMIN)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user was login' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMe(@Req() req) {
    const userId = req.user.id;
    return this.userService.findMe(userId);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('userId') userId: string, @Req() req: Request) {
    const requesterId = (req as any).user.id;
    const requesterRole = (req as any).user.role;
    return this.userService.findOne(userId, requesterId, requesterRole);
  }

  @ApiOperation({ summary: 'Update user' })
  @Patch('update/:userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const requesterId = (req as any).user.id;
    return this.userService.update(userId, updateUserDto, requesterId);
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete('delete/:userId')
  remove(@Param('userId') id: string, @Req() req: Request) {
    const requesterId = (req as any).user.id;
    return this.userService.remove(id, requesterId);
  }
}
