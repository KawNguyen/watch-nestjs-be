import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { checkDuplicateAddresses } from './utils/address.utils';
import { buildUpsertData } from './helper/address.helpers';
import { assertCanAccessResource } from 'src/common/helpers/assert-can-access-resource.helpers';
import { assertIsOwner } from 'src/common/helpers/assert-is-owner.helpers';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        password: false,
      },
    });

    return data;
  }

  async create(createUserDto: CreateUserDto) {
    const { addresses, ...rest } = createUserDto as any;
    return this.prisma.user.create({
      data: {
        ...rest,
        ...(addresses && {
          addresses: {
            create: Array.isArray(addresses) ? addresses : [addresses],
          },
        }),
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        password: false,
      },
    });
  }

  async findMe(id: string) {
    if (!id) {
      throw new ForbiddenException('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        addresses: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('User not found or unauthorized');
    }

    return user;
  }

  async findOne(id: string, requesterId: string, role: string) {
    assertCanAccessResource(id, requesterId, role, { action: 'view' });

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        password: false,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, requesterId: string) {
    assertIsOwner(id, requesterId);

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { addresses, ...rest } = updateUserDto;

    const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    if (addresses) {
      const addressArray = Array.isArray(addresses) ? addresses : [addresses];
      checkDuplicateAddresses(addressArray);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        password: hashedPassword,
        ...(addresses && {
          addresses: {
            upsert: buildUpsertData(addresses),
          },
        }),
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, requesterId: string) {
    assertIsOwner(id, requesterId);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
