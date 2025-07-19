import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllAddressByUserId(userId: string) {
    const data = await this.prismaService.address.findMany({
      where: { userId },
      select: {
        id: true,
        street: true,
        district: true,
        ward: true,
        city: true,
        country: true,
      },
    });
    return data;
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const existingAddress = await this.prismaService.address.findFirst({
      where: {
        userId,
        street: dto.street,
        district:
          typeof dto.district === 'object' && dto.district !== null
            ? { equals: dto.district.code }
            : undefined,
        ward:
          typeof dto.ward === 'object' && dto.ward !== null
            ? { equals: dto.ward.code }
            : undefined,
        city:
          typeof dto.city === 'object' && dto.city !== null
            ? { equals: dto.city.code }
            : undefined,
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
        district: dto.district ? JSON.stringify(dto.district) : undefined,
        ward: dto.ward ? JSON.stringify(dto.ward) : undefined,
        city: dto.city ? JSON.stringify(dto.city) : undefined,
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
      data: {
        ...dto,
        district: dto.district ? JSON.stringify(dto.district) : undefined,
        ward: dto.ward ? JSON.stringify(dto.ward) : undefined,
        city: dto.city ? JSON.stringify(dto.city) : undefined,
      },
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
