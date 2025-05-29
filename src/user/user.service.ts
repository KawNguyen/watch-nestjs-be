import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        profile: createUserDto.profile
          ? {
              create: createUserDto.profile,
            }
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ include: { profile: true } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });
  }

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: false,
        email: false,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  
    if (!user) {
      throw new ForbiddenException('User not found or unauthorized');
    }
  
    return user;
  }
  

  async findOne(userId: string, requesterId: string, role: string) {
    if (userId !== requesterId && role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to view this profile',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    requesterId: string,
  ) {
    if (userId !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        userId,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.prisma.user.update({
      where: { userId },
      data: {
        ...updateUserDto,
        profile: updateUserDto.profile
          ? {
              update: updateUserDto.profile,
            }
          : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async remove(userId: string, requesterId: string) {
    if (userId !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to delete this profile',
      );
    }

    return this.prisma.user.delete({
      where: { userId },
    });
  }
}
