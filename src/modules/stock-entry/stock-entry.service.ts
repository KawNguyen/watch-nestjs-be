import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateStockEntryDto,
  GetAllStockEntriesDto,
  GetStockStatisticsDto,
} from './dto/stock-entry.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockEntryService {
  private readonly logger = new Logger(StockEntryService.name, {
    timestamp: true,
  });

  constructor(private readonly prismaService: PrismaService) {}

  async getAllStockEntries(dto: GetAllStockEntriesDto) {
    const { page = 1, limit = 12, keyword, createdBy } = dto;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (keyword) {
      whereClause.OR = [
        { entryCode: { contains: keyword, mode: 'insensitive' } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
        { user: { firstName: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    if (createdBy) {
      whereClause.createdBy = createdBy;
    }

    const [items, totalItems] = await Promise.all([
      this.prismaService.stockEntry.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          stockItems: true,
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
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        stockItems: true,
      },
    });
    return data;
  }

  async createStockEntryV2(createStockEntry: CreateStockEntryDto) {
    const { createdBy, notes, stockItems } = createStockEntry;
    const result = await this.prismaService.$transaction(async (tx) => {
      try {
        const user = await this.prismaService.user.findUnique({
          where: { id: createdBy },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const watchIds = stockItems.map((item) => item.watchId);

        const existingWatches = await tx.watch.findMany({
          where: { id: { in: watchIds } },
          select: { id: true },
        });

        const existingIds = new Set(existingWatches.map((w) => w.id));
        const invalidIds = watchIds.filter((id) => !existingIds.has(id));

        if (invalidIds.length > 0) {
          throw new BadRequestException(
            `Invalid watchId(s): ${invalidIds.join(', ')}`,
          );
        }

        const totalPrice = stockItems.reduce(
          (acc, cur) => acc + cur.quantity * cur.costPrice,
          0,
        );

        const stockEntry = await tx.stockEntry.create({
          data: {
            createdBy,
            totalPrice,
            notes,
            stockItems: {
              createMany: {
                data: stockItems.map((item) => ({
                  watchId: item.watchId,
                  quantity: item.quantity,
                  costPrice: item.costPrice,
                })),
              },
            },
          },
        });

        await Promise.all(
          stockItems.map((item) =>
            tx.watchInventory.upsert({
              where: { watchId: item.watchId },
              create: {
                watchId: item.watchId,
                quantity: item.quantity,
              },
              update: {
                quantity: {
                  increment: item.quantity,
                },
              },
            }),
          ),
        );

        return stockEntry;
      } catch (error) {
        this.logger.error(error.message);
        throw error;
      }
    });

    return result;
  }

  async getStockStatistics(dto: GetStockStatisticsDto) {
    const { startDate, endDate } = dto;

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

    const stockStatistics = await this.prismaService.stockEntry.findMany({
      where,
      select: {
        createdAt: true,
        totalPrice: true,
        stockItems: {
          select: {
            watchId: true,
            quantity: true,
            costPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalEntries,
      totalValue: totalValue._sum.totalPrice || 0,
      totalItems: totalItems._sum.quantity || 0,
      stockStatistics: stockStatistics,
    };
  }
}
