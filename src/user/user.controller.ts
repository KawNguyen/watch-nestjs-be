import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all user' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  findOne(@Param('userId') userId: string, @Req() req: Request) {
    const requesterId = (req as any).user.userId;
    return this.userService.findOne(userId, requesterId);
  }

  @ApiOperation({ summary: 'Update user' })
  @UseGuards(JwtAuthGuard)
  @Patch('update/:userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const requesterId = (req as any).user.userId;
    return this.userService.update(userId, updateUserDto, requesterId);
  }

  @ApiOperation({ summary: 'Delete user' })
  @UseGuards(JwtAuthGuard)
  @Delete('delete/:userId')
  remove(@Param('userId') id: string, @Req() req: Request) {
    const requesterId = (req as any).user.userId;
    return this.userService.remove(id, requesterId);
  }
}
