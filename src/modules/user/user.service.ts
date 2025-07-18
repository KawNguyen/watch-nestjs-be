import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  ChangeAvatarDto,
  ChangePasswordDto,
  CreateUserDto,
  GetAllUserDto,
  UpdateUserDto,
} from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { assertCanAccessResource } from 'src/common/helpers/assert-can-access-resource.helpers';
import { assertIsOwner } from 'src/common/helpers/assert-is-owner.helpers';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(dto: GetAllUserDto) {
    const { page = 1, limit = 12, keyword } = dto;

    const where: Prisma.UserWhereInput = keyword
      ? {
          OR: [
            { firstName: { contains: keyword, mode: 'insensitive' } },
            { lastName: { contains: keyword, mode: 'insensitive' } },
            { email: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      totalItems,
      totalPages,
      page,
      limit,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { addresses, ...rest } = createUserDto;
    return this.prisma.user.create({
      data: {
        ...rest,
        ...(rest.avatar && {
          avatar: JSON.parse(JSON.stringify(rest.avatar)),
        }),
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
      // throw new ForbiddenException('User ID is required');
      return null; // Do not throw an exception, just return null
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
        addresses: {
          select: {
            id: true,
            street: true,
            district: true,
            ward: true,
            city: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return null;
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

    const { ...rest } = updateUserDto;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...rest,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });
  }

  async changePassword(
    id: string,
    dto: ChangePasswordDto,
    requesterId: string,
  ) {
    assertIsOwner(id, requesterId);

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      return null;
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new ForbiddenException(
        'New password must be different from current password',
      );
    }

    if (dto.newPassword.length < 6) {
      throw new ForbiddenException(
        'New password must be at least 6 characters',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }

  async changeAvatar(dto: ChangeAvatarDto, requesterId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { avatar: true },
    });

    if (!user) return null;

    const currentAvatar = user.avatar;

    if (
      currentAvatar &&
      typeof currentAvatar === 'object' &&
      'public_id' in currentAvatar &&
      typeof currentAvatar.public_id === 'string' &&
      currentAvatar.public_id.trim() !== ''
    ) {
      try {
        await this.cloudinaryService.deleteImage(currentAvatar.public_id);
      } catch (error) {
        console.error('Cloudinary delete error:', error);
      }
    }

    return this.prisma.user.update({
      where: { id: requesterId },
      data: {
        avatar: {
          absolute_url: dto.avatar.absolute_url,
          public_id: dto.avatar.public_id || null,
        },
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
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
