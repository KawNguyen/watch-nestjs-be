import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  Query,
  UseGuards,
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
    description: 'Add a new address for a user',
  })
  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addAddress(
    @Query('userId') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    const data = await this.addressService.addAddress(userId, dto);
    return formatResponse(data, 'Address added successfully');
  }

  @ApiProperty({
    description: 'Update an existing address for a user',
  })
  @Patch('update')
  @UseGuards(JwtAuthGuard)
  async updateAddress(
    @Query('userId') userId: string,
    @Query('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressService.updateAddress(userId, id, dto);
    return formatResponse(data, 'Address updated successfully');
  }

  @ApiProperty({
    description: 'Remove an existing address for a user',
  })
  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async removeAddress(
    @Query('userId') userId: string,
    @Query('id') id: string,
  ) {
    const data = await this.addressService.removeAddress(userId, id);
    return formatResponse(data, 'Address removed successfully');
  }
}
