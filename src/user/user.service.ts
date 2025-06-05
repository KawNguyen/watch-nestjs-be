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
    return this.prisma.user.findMany({
      select: { id: true, email: true, password: false, profile: true },
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
        password: false,
        profile: true,
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

  async findOne(id: string, requesterId: string, role: string) {
    if (id !== requesterId && role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to view this profile',
      );
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        password: false,
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requesterId: string,
  ) {
    if (id !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to update this profile',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.prisma.user.update({
      where: { id },
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

  async remove(id: string, requesterId: string) {
    if (id !== requesterId) {
      throw new ForbiddenException(
        'You do not have permission to delete this profile',
      );
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
