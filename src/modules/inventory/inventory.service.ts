import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(dto: GetInventoryDto) {
    const { keyword, page = 1, limit = 12 } = dto;
    const whereClause: Prisma.WatchInventoryWhereInput = keyword
      ? {
          OR: [
            {
              watch: {
                name: {
                  contains: keyword,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
            },
            {
              watch: {
                brand: {
                  name: {
                    contains: keyword,
                    mode: 'insensitive' as Prisma.QueryMode,
                  },
                },
              },
            },
          ],
        }
      : {};

    const [totalItems, items] = await this.prismaService.$transaction([
      this.prismaService.watchInventory.count({ where: whereClause }),
      this.prismaService.watchInventory.findMany({
        where: whereClause,
        include: {
          watch: {
            include: {
              brand: true,
              material: true,
              bandMaterial: true,
              movement: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      items,
    };
  }
}
