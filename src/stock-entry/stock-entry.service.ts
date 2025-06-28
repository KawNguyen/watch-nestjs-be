import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateStockEntryDto,
  GetAllStockEntriesDto,
} from './dto/stock-entry.dto';

@Injectable()
export class StockEntryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllStockEntries(dto: GetAllStockEntriesDto) {
    const { page = 1, limit = 12, keyword, addedById } = dto;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (keyword) {
      whereClause.addedBy = {
        OR: [
          { email: { contains: keyword, mode: 'insensitive' } },
          { name: { contains: keyword, mode: 'insensitive' } },
        ],
      };
    }

    if (addedById) {
      whereClause.addedById = addedById;
    }

    const [items, totalItems] = await Promise.all([
      this.prismaService.stockEntry.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          addedBy: {
            select: { id: true, email: true, firstName: true },
          },
          stockItems: {
            include: {
              watch: {
                select: { id: true, name: true, images: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.stockEntry.count({
        where: whereClause,
      }),
    ]);

    return {
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getStockEntryById(id: string) {
    const data = await this.prismaService.stockEntry.findUnique({
      where: { id },
      include: {
        addedBy: true,
        stockItems: true,
      },
    });
    return data;
  }

  async createStockEntry(createStockEntryDto: CreateStockEntryDto) {
    const { addedById, stockItems } = createStockEntryDto;

    const user = await this.prismaService.user.findUnique({
      where: { id: addedById },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const watchIds = stockItems.map((item) => item.watchId);
    const watches = await this.prismaService.watch.findMany({
      where: { id: { in: watchIds } },
    });

    if (watches.length !== watchIds.length) {
      throw new BadRequestException('One or more watches do not exist');
    }

    const totalPrice = stockItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const result = await this.prismaService.$transaction(async (prisma) => {
      const stockEntry = await prisma.stockEntry.create({
        data: {
          addedById,
          totalPrice,
        },
      });

      const stockItemsData = stockItems.map((item) => ({
        stockEntryId: stockEntry.id,
        watchId: item.watchId,
        quantity: item.quantity,
        price: item.price,
      }));

      await prisma.stockItem.createMany({
        data: stockItemsData,
      });

      await Promise.all(
        stockItems.map(async (item) => {
          const existingInventory = await prisma.inventory.findUnique({
            where: { watchId: item.watchId },
          });

          if (existingInventory) {
            await prisma.inventory.update({
              where: { watchId: item.watchId },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          } else {
            await prisma.inventory.create({
              data: {
                watchId: item.watchId,
                quantity: item.quantity,
              },
            });
          }
        }),
      );

      return await prisma.stockEntry.findUnique({
        where: { id: stockEntry.id },
        include: {
          addedBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          stockItems: {
            include: {
              watch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  brand: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    return result;
  }

  async getStockStatistics(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const [totalEntries, totalValue, totalItems] = await Promise.all([
      this.prismaService.stockEntry.count({ where }),
      this.prismaService.stockEntry.aggregate({
        where,
        _sum: {
          totalPrice: true,
        },
      }),
      this.prismaService.stockItem.aggregate({
        where: {
          stockEntry: where,
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      totalEntries,
      totalValue: totalValue._sum.totalPrice || 0,
      totalItems: totalItems._sum.quantity || 0,
    };
  }
}
