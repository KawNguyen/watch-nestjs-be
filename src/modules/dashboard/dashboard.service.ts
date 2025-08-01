import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryDashboardStatisticDto } from './dto/query-dashboard-statistic.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';

type SortDirection = 'asc' | 'desc';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getStatisticsForDateRange(query: QueryDashboardStatisticDto) {
    let { startDate, endDate } = query;

    if (!startDate || !endDate) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);
      endDate = today.toISOString().split('T')[0];
      startDate = sevenDaysAgo.toISOString().split('T')[0];
    }

    const filters = this.createDateRangeFilter(startDate, endDate);

    const [
      orderInsights,
      orderStatusCounts,
      lowStockProducts,
      saleInsights,
      dailyRevenue,
      totalItemsSold,
    ] = await Promise.all([
      this.getOrderInsights(filters),
      this.getOrderStatusCounts(filters),
      this.getLowStockProducts(),
      this.getSaleInsights(filters),
      this.getDailyRevenue(startDate, endDate),
      this.countSoldItems(filters),
    ]);

    return {
      totalItemsSold,
      totalOrders: orderInsights.count,
      totalRevenue: orderInsights.revenue,
      orderStatusCounts,
      dailyRevenue,
      ...saleInsights,
      lowStockProducts,
    };
  }

  async getStatisticsForToday() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const filters = this.createDateRangeFilter(todayStr, todayStr);

    const [orderInsights, orderStatusCounts, totalItemsSold] =
      await Promise.all([
        this.getOrderInsights(filters),
        this.getOrderStatusCounts(filters),
        this.countSoldItems(filters),
      ]);

    return {
      date: todayStr,
      totalItemsSold,
      totalOrders: orderInsights.count,
      totalRevenue: orderInsights.revenue,
      orderStatusCounts,
    };
  }

  private createDateRangeFilter(startDateStr?: string, endDateStr?: string) {
    const filter: Prisma.OrderWhereInput = {};
    if (startDateStr || endDateStr) {
      filter.createdAt = {};
      if (startDateStr) {
        filter.createdAt.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        filter.createdAt.lte = new Date(`${endDateStr}T23:59:59.999Z`);
      }
    }
    return filter;
  }

  private async getOrderInsights(filters: Prisma.OrderWhereInput) {
    const result = await this.prismaService.order.aggregate({
      _count: { id: true },
      _sum: { totalPrice: true },
      where: filters,
    });

    return {
      count: result._count.id || 0,
      revenue: result._sum.totalPrice || 0,
    };
  }

  private async getOrderStatusCounts(filters: Prisma.OrderWhereInput) {
    return this.prismaService.order.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: {
        ...filters,
        status: {
          in: [OrderStatus.COMPLETED, OrderStatus.CANCELED],
        },
      },
    });
  }

  private async getLowStockProducts() {
    return this.prismaService.watchInventory.findMany({
      where: {
        quantity: {
          lte: this.prismaService.watchInventory.fields.lowStockThreshold,
        },
      },
      select: {
        quantity: true,
        lowStockThreshold: true,
        watch: {
          select: {
            id: true,
            name: true,
            images: {
              select: { absolute_url: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  private async getSaleInsights(filters: Prisma.OrderWhereInput, limit = 5) {
    const [mostSold, leastSold, zeroSold] = await Promise.all([
      this.getRankedSoldProducts('desc', limit, filters),
      this.getRankedSoldProducts('asc', limit, filters),
      this.getZeroSoldProducts(limit),
    ]);

    return { mostSold, leastSold, zeroSold };
  }

  private async getRankedSoldProducts(
    direction: SortDirection,
    limit: number,
    filters: Prisma.OrderWhereInput,
  ) {
    const rankedItems = await this.prismaService.orderItem.groupBy({
      by: ['watchId'],
      _sum: { quantity: true },
      where: {
        order: filters,
      },
      orderBy: {
        _sum: { quantity: direction },
      },
      take: limit,
    });

    if (rankedItems.length === 0) return [];

    const watchIds = rankedItems.map((item) => item.watchId);

    const watches = await this.prismaService.watch.findMany({
      where: { id: { in: watchIds } },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        brand: { select: { name: true } },
        images: { select: { absolute_url: true }, take: 1 },
      },
    });

    const watchMap = new Map(watches.map((watch) => [watch.id, watch]));

    return rankedItems.map((item) => ({
      ...watchMap.get(item.watchId),
      totalSoldQuantity: item._sum.quantity,
    }));
  }

  private async getZeroSoldProducts(limit: number) {
    return this.prismaService.watch.findMany({
      where: {
        orderItems: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        brand: { select: { name: true } },
        images: { select: { absolute_url: true }, take: 1 },
      },
      take: limit,
    });
  }

  private async getDailyRevenue(startDate: string, endDate: string) {
    const query = Prisma.sql`
      SELECT
        to_char(day_series.day, 'YYYY-MM-DD') AS date,
        COALESCE(SUM(o."totalPrice"), 0)::float AS revenue,
        COUNT(o.id)::int AS "orderCount"
      FROM
        (SELECT generate_series(
            ${new Date(startDate)}::date,
            ${new Date(endDate)}::date,
            '1 day'::interval
          )::date AS day) AS day_series
      LEFT JOIN "Order" AS o ON date_trunc('day', o."createdAt") = day_series.day
      AND o.status = 'COMPLETED'
      GROUP BY
        day_series.day
      ORDER BY
        day_series.day ASC;
    `;

    return this.prismaService.$queryRaw<
      { date: string; revenue: number; orderCount: number }[]
    >(query);
  }

  private async countSoldItems(filters: Prisma.OrderWhereInput) {
    const totalItemsSold = await this.prismaService.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: {
          ...filters,
          status: OrderStatus.COMPLETED,
        },
      },
    });

    return totalItemsSold._sum.quantity || 0;
  }
}
