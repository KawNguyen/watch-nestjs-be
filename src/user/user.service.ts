import { Injectable } from '@nestjs/common';
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

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        userId: id,
      },
      include: {
        profile: true,
      },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
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

  async remove(userId: string) {
    return this.prisma.user.delete({
      where: { userId },
    });
  }
}
