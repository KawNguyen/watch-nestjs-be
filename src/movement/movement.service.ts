import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMovementDto, UpdateMovementDto } from './dto/movement.dto';
import { generateSlug } from 'src/utils/slug.util';

@Injectable()
export class MovementService {
  constructor(private prismaService: PrismaService) {}

  async getAllMovements() {
    return this.prismaService.movement.findMany();
  }

  async getMovementById(movementId: string) {
    const movement = await this.prismaService.movement.findUnique({
      where: { movementId },
    });

    if (!movement) {
      throw new NotFoundException(`Movement with ID ${movementId} not found`);
    }

    return movement;
  }

  async createMovement(movementData: CreateMovementDto) {
    const existingMovement = await this.prismaService.movement.findFirst({
      where: { name: movementData.name },
    });

    if (existingMovement) {
      throw new NotFoundException(
        `Movement with name ${movementData.name} already exists`,
      );
    }

    const slug = generateSlug(movementData.name);
    return this.prismaService.movement.create({
      data: { ...movementData, slug },
    });
  }

  async updateMovement(movementId: string, movementData: UpdateMovementDto) {
    const existingMovement = await this.prismaService.movement.findUnique({
      where: { movementId },
    });

    if (!existingMovement) {
      throw new NotFoundException(`Movement with ID ${movementId} not found`);
    }
    const slug = movementData.name
      ? generateSlug(movementData.name)
      : existingMovement.slug;
    return this.prismaService.movement.update({
      where: { movementId },
      data: { ...movementData, slug },
    });
  }

  async deleteMovement(movementId: string) {
    const existingMovement = await this.prismaService.movement.findUnique({
      where: { movementId },
    });

    if (!existingMovement) {
      throw new NotFoundException(`Movement with ID ${movementId} not found`);
    }

    return this.prismaService.movement.delete({
      where: { movementId },
    })
  }
}
