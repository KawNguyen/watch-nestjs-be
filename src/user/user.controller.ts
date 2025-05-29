import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorators';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @ApiOperation({ summary: 'Get all user' })
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user was login' })
  @Get('me')
  findMe(@Req() req: Request) {
    const userId = (req as any).user.userId;
    return this.userService.findMe(userId);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Get(':userId')
  findOne(@Param('userId') userId: string, @Req() req: Request) {
    const requesterId = (req as any).user.userId;
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
    const requesterId = (req as any).user.userId;
    return this.userService.update(userId, updateUserDto, requesterId);
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete('delete/:userId')
  remove(@Param('userId') id: string, @Req() req: Request) {
    const requesterId = (req as any).user.userId;
    return this.userService.remove(id, requesterId);
  }
}
