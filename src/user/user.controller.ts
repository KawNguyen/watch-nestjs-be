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
import { formatResponse } from 'src/common/helpers/response.helpers';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all user' })
  @Roles(Role.ADMIN)
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const data = await this.userService.findAll();
    return formatResponse(data, 'Fetch all users successfully');
  }

  @ApiOperation({ summary: 'Get user was login' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() req) {
    const userId = req.user.id;
    const data = await this.userService.findMe(userId);
    return formatResponse(data, 'Fetch your profile successfully');
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('userId') userId: string, @Req() req: Request) {
    const requesterId = (req as any).user.id;
    const requesterRole = (req as any).user.role;
    const data = await this.userService.findOne(
      userId,
      requesterId,
      requesterRole,
    );
    return formatResponse(data, 'Fetch user by ID successfully');
  }

  @ApiOperation({ summary: 'Update user' })
  @Patch('update/:userId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.userService.update(
      userId,
      updateUserDto,
      requesterId,
    );
    return formatResponse(data, 'Update user successfully');
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete('delete/:userId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('userId') id: string, @Req() req: Request) {
    const requesterId = (req as any).user.id;
    const data = await this.userService.remove(id, requesterId);
    return formatResponse(data, 'Delete user successfully')
  }
}
