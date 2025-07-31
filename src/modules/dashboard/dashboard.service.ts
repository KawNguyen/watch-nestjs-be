import { Injectable } from '@nestjs/common';
import { QueryDashboardStatisticDto } from './dto/query-dashboard-statistic.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  private getDateRangeFilter(
    startDate: string | undefined,
    endDate: string | undefined,
  ) {
    const filters: any = {};

    if (startDate || endDate) {
      filters.createdAt = {};

      if (startDate) {
        filters.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        filters.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    return filters;
  }

  private async getOrderInsight(filters: any) {
    return await this.prismaService.order.aggregate({
      _count: {
        _all: true,
      },
      _sum: {
        totalPrice: true,
      },
      where: {
        ...filters,
      },
    });
  }

  private async getOrderStatusCounts(filters: any) {
    return await this.prismaService.order.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
      where: {
        ...filters,
        status: {
          in: [OrderStatus.COMPLETED, OrderStatus.CANCELED],
        },
      },
    });
  }

  private async getLowStockProducts() {
    return await this.prismaService.watchInventory.findMany({
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
              select: {
                public_id: true,
                absolute_url: true,
              },
            },
          },
        },
      },
    });
  }

  private async getMostSoldProducts(limit: number = 5) {
    const mostSold = await this.prismaService.orderItem.groupBy({
      by: ['watchId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const watchIds = mostSold.map((item) => item.watchId);

    const watches = await this.prismaService.watch.findMany({
      where: {
        id: {
          in: watchIds,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: {
          select: {
            absolute_url: true,
            public_id: true,
          },
          take: 1, // Lấy một hình ảnh đại diện
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    const result = mostSold.map((item) => {
      const watchInfo = watches.find((watch) => watch.id === item.watchId);
      return {
        ...watchInfo,
        totalSoldQuantity: item._sum.quantity,
      };
    });

    return result;
  }

  private async getLeastSoldProducts(limit: number = 5) {
    const leastSold = await this.prismaService.orderItem.groupBy({
      by: ['watchId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'asc',
        },
      },
      take: limit,
    });

    const watchIds = leastSold.map((item) => item.watchId);
    const watches = await this.prismaService.watch.findMany({
      where: {
        id: {
          in: watchIds,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: {
          select: {
            absolute_url: true,
            public_id: true,
          },
          take: 1,
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    const result = leastSold.map((item) => {
      const watchInfo = watches.find((watch) => watch.id === item.watchId);
      return {
        ...watchInfo,
        totalSoldQuantity: item._sum.quantity,
      };
    });

    return result;
  }

  private async getSaleInsigts(limit: number = 5) {
    const mostSold = await this.prismaService.orderItem.groupBy({
      by: ['watchId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const soldWatchIds = mostSold.map((item) => item.watchId);

    const leastSold = await this.prismaService.orderItem.groupBy({
      by: ['watchId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'asc',
        },
      },
      take: limit,
      where: {
        watchId: {
          notIn: soldWatchIds, // Loại trừ các sản phẩm đã có trong "mostSold" để tránh trùng lặp nếu limit nhỏ
        },
      },
    });

    // Lấy các sản phẩm chưa từng bán
    const allSoldIdsFromOrderItems =
      await this.prismaService.orderItem.findMany({
        distinct: ['watchId'],
        select: {
          watchId: true,
        },
      });
    const allSoldIds = allSoldIdsFromOrderItems.map((item) => item.watchId);

    const zeroSoldProducts = await this.prismaService.watch.findMany({
      where: {
        id: {
          notIn: allSoldIds,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: {
          select: {
            absolute_url: true,
            public_id: true,
          },
          take: 1,
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
    });

    // Gom tất cả các watchIds cần tìm thông tin chi tiết
    const allRelevantWatchIds = new Set([
      ...mostSold.map((item) => item.watchId),
      ...leastSold.map((item) => item.watchId),
      ...zeroSoldProducts.map((item) => item.id),
    ]);

    const watchesDetails = await this.prismaService.watch.findMany({
      where: {
        id: {
          in: Array.from(allRelevantWatchIds),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: {
          select: {
            absolute_url: true,
            public_id: true,
          },
          take: 1,
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    const mapWatchDetails = new Map(
      watchesDetails.map((watch) => [watch.id, watch]),
    );

    const formattedMostSold = mostSold.map((item) => ({
      ...mapWatchDetails.get(item.watchId),
      totalSoldQuantity: item._sum.quantity,
    }));

    const formattedLeastSold = leastSold.map((item) => ({
      ...mapWatchDetails.get(item.watchId),
      totalSoldQuantity: item._sum.quantity,
    }));

    const formattedZeroSold = zeroSoldProducts.map((product) => ({
      ...mapWatchDetails.get(product.id),
      totalSoldQuantity: 0,
    }));

    return {
      mostSold: formattedMostSold,
      leastSold: formattedLeastSold, // Sản phẩm bán ít nhất (đã có ít nhất 1 lần bán)
      zeroSold: formattedZeroSold, // Sản phẩm chưa từng được bán
    };
  }

  // private async getDailyRevenue(startDate: string, endDate: string) {
  //   // Get all completed orders within the date range
  //   const orders = await this.prismaService.order.findMany({
  //     where: {
  //       status: OrderStatus.COMPLETED,
  //       createdAt: {
  //         gte: new Date(startDate),
  //         lte: new Date(endDate + 'T23:59:59.999Z'), // Include end of day
  //       },
  //     },
  //     select: {
  //       totalPrice: true,
  //       createdAt: true,
  //     },
  //   });

  //   // Generate date series
  //   const start = new Date(startDate);
  //   const end = new Date(endDate);
  //   const dateRange: string[] = [];

  //   for (
  //     let date = new Date(start);
  //     date <= end;
  //     date.setDate(date.getDate() + 1)
  //   ) {
  //     dateRange.push(date.toISOString().split('T')[0]);
  //   }

  //   // Group orders by date and calculate metrics
  //   const ordersByDate = new Map<
  //     string,
  //     { revenue: number; orderCount: number }
  //   >();

  //   orders.forEach((order) => {
  //     const dateKey = order.createdAt.toISOString().split('T')[0];
  //     const existing = ordersByDate.get(dateKey) || {
  //       revenue: 0,
  //       orderCount: 0,
  //     };

  //     ordersByDate.set(dateKey, {
  //       revenue: existing.revenue + order.totalPrice,
  //       orderCount: existing.orderCount + 1,
  //     });
  //   });

  //   // Format results to match desired structure
  //   return dateRange.map((date) => ({
  //     date,
  //     revenue: Math.round(ordersByDate.get(date)?.revenue || 0),
  //     orderCount: ordersByDate.get(date)?.orderCount || 0,
  //   }));
  // }

  private async getDailyRevenue(startDate: string, endDate: string) {
    // This single query replaces all the logic from your original function.
    const query = Prisma.sql`
    SELECT
      to_char(day_series.day, 'YYYY-MM-DD') AS date,
      COALESCE(SUM(o."totalPrice"), 0)::float AS revenue,
      COUNT(o.id)::int AS "orderCount"
    FROM
      -- 1. Generate a series of all dates in the range directly in the DB
      (SELECT generate_series(
          ${new Date(startDate)}::date,
          ${new Date(endDate)}::date,
          '1 day'::interval
        )::date AS day) AS day_series
    -- 2. Join with orders that fall on each specific day
    LEFT JOIN "Order" AS o ON date_trunc('day', o."createdAt") = day_series.day
    AND o.status = 'COMPLETED'
    -- 3. Group and aggregate within the DB
    GROUP BY
      day_series.day
    ORDER BY
      day_series.day ASC;
  `;

    // 4. Execute the single, powerful query
    return await this.prismaService.$queryRaw<
      [{ date: string; revenue: number; orderCount: number }]
    >(query);
  }

  async getStatistics(query: QueryDashboardStatisticDto) {
    const { startDate, endDate } = query;

    const today = new Date();
    const endDateForLast7Days = today.toISOString().split('T')[0];
    const startDateForLast7Days = new Date(today.setDate(today.getDate() - 6))
      .toISOString()
      .split('T')[0];

    const filters = this.getDateRangeFilter(startDate, endDate);

    const [
      totalOrderByStatus,
      totalOrderInsights,
      totalLowStockProducts,
      saleInsights,
      dailyRevenueLast7Days,
    ] = await Promise.all([
      this.getOrderStatusCounts(filters),
      this.getOrderInsight(filters),
      this.getLowStockProducts(),
      this.getSaleInsigts(),
      this.getDailyRevenue(startDateForLast7Days, endDateForLast7Days),
    ]);

    return {
      totalOrderByStatus,
      totalOrders: totalOrderInsights._count._all || 0,
      totalPrice: totalOrderInsights._sum.totalPrice || 0,
      totalLowStockProducts,
      ...saleInsights,
      dailyRevenueLast7Days,
    };
  }
}
