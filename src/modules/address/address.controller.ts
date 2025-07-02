import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Param,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { formatResponse } from 'src/common/helpers/response.helpers';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @ApiProperty({
    description: 'Get all addresses by userId',
  })
  @Get('my-address')
  @UseGuards(JwtAuthGuard)
  async getAllAddressByUserId(@Req() req: Request) {
    const requesterId = (req as any).user.id;
    const data = await this.addressService.getAllAddressByUserId(requesterId);
    return formatResponse(data, 'Fetch all addresses by userId successfully');
  }

  @ApiProperty({
    description: 'Add a new address for a user',
  })
  @Post('users/:userId/add')
  @UseGuards(JwtAuthGuard)
  async addAddress(
    @Param('userId') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    const data = await this.addressService.addAddress(userId, dto);
    return formatResponse(data, 'Address added successfully');
  }

  @ApiProperty({
    description: 'Update an existing address for a user',
  })
  @Patch('users/:userId/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateAddress(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressService.updateAddress(userId, id, dto);
    return formatResponse(data, 'Address updated successfully');
  }

  @ApiProperty({
    description: 'Remove an existing address for a user',
  })
  @Delete('users/:userId/delete/:id')
  @UseGuards(JwtAuthGuard)
  async removeAddress(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ) {
    const data = await this.addressService.removeAddress(userId, id);
    return formatResponse(data, 'Address removed successfully');
  }
}
