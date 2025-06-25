import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePasswordDto,
  GetAllUserDto,
  UpdateUserDto,
} from './dto/user.dto';
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
  async findAll(@Query() dto: GetAllUserDto) {
    const data = await this.userService.findAll(dto);
    return formatResponse(data.items, 'Fetch all users successfully', {
      limit: data.limit,
      page: data.page,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
    });
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
  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.userService.update(
      id,
      updateUserDto,
      requesterId,
    );
    return formatResponse(data, 'Update user successfully');
  }

  @ApiOperation({ summary: 'Change password' })
  @Patch('change-password/:userId')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const requesterId = (req as any).user.id;
    const data = await this.userService.changePassword(
      userId,
      changePasswordDto,
      requesterId,
    );
    return formatResponse(data, 'Change password successfully');
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete('delete/:userId')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('userId') id: string, @Req() req: Request) {
    const requesterId = (req as any).user.id;
    const data = await this.userService.remove(id, requesterId);
    return formatResponse(data, 'Delete user successfully');
  }
}
