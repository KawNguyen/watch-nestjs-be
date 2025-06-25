import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async addAddress(userId: string, dto: CreateAddressDto) {
    const existingAddress = await this.prismaService.address.findFirst({
      where: {
        userId,
        street: dto.street,
        district: dto.district,
        ward: dto.ward,
        city: dto.city,
        country: dto.country,
      },
    });

    if (existingAddress) {
      return existingAddress;
    }

    return this.prismaService.address.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async updateAddress(userId: string, id: string, dto: CreateAddressDto) {
    const existingAddress = await this.prismaService.address.findFirst({
      where: { userId, id },
    });

    if (!existingAddress) {
      throw new Error('Address not found');
    }

    if (existingAddress.id !== id || existingAddress.userId !== userId) {
      throw new Error('You can only update your own address');
    }

    return this.prismaService.address.update({
      where: { id: existingAddress.id },
      data: dto,
    });
  }

  async removeAddress(userId: string, id: string) {
    if (id) {
      const existingAddress = await this.prismaService.address.findUnique({
        where: { id },
      });

      if (!existingAddress) {
        throw new Error('Address not found');
      }

      return this.prismaService.address.delete({
        where: { id: existingAddress.id, userId },
      });
    }
  }
}
