import { prisma } from '@/config/database';
import { QuoteStatus, ServiceOrderStatus, TransactionType } from '@prisma/client';

export class DashboardService {
  private toNumber(value: { toNumber(): number } | number | null | undefined) {
    if (typeof value === 'number') {
      return value;
    }

    if (value && typeof value === 'object' && 'toNumber' in value) {
      return value.toNumber();
    }

    return 0;
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(userId: string, userRole: string) {
    const where: any = {};

    // Non-admin users can only see their own stats
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel queries for better performance
    const [
      clientsCount,
      productsCount,
      servicesCount,
      quotesStats,
      serviceOrdersStats,
      recentQuotes,
      recentServiceOrders,
      monthlyRevenue,
      yearlyRevenue,
      last30DaysRevenue,
      lowStockProducts,
    ] = await Promise.all([
      // Total counts
      prisma.client.count({ where: { ...where, active: true } }),
      prisma.product.count({ where: { ...where, active: true } }),
      prisma.service.count({ where: { ...where, active: true } }),

      // Quotes statistics
      prisma.quote.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: {
          totalValue: true,
        },
      }),

      // Service orders statistics
      prisma.serviceOrder.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      // Recent quotes
      prisma.quote.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // Recent service orders
      prisma.serviceOrder.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      // Monthly revenue
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.INCOME,
          date: {
            gte: startOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Yearly revenue
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.INCOME,
          date: {
            gte: startOfYear,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Last 30 days revenue
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: TransactionType.INCOME,
          date: {
            gte: last30Days,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Low stock products
      prisma.product.findMany({
        where: {
          ...(userRole !== 'ADMIN' ? { userId } : {}),
          active: true,
          stock: {
            lte: prisma.product.fields.minStock,
          },
        },
        orderBy: {
          stock: 'asc',
        },
        take: 10,
      }),
    ]);

    // Process quotes stats
    const quotesStatsByStatus = quotesStats.reduce<Record<string, { count: number; totalValue: number }>>((acc, stat) => {
      acc[stat.status] = {
        count: stat._count,
        totalValue: this.toNumber(stat._sum.totalValue),
      };
      return acc;
    }, {});

    // Process service orders stats
    const ordersStatsByStatus = serviceOrdersStats.reduce<Record<string, number>>((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {});

    // Calculate totals
    const totalQuotes = quotesStats.reduce((sum: number, stat) => sum + stat._count, 0);
    const totalQuotesValue = quotesStats.reduce(
      (sum: number, stat) => sum + this.toNumber(stat._sum.totalValue),
      0
    );
    const totalServiceOrders = serviceOrdersStats.reduce((sum: number, stat) => sum + stat._count, 0);

    return {
      counts: {
        clients: clientsCount,
        products: productsCount,
        services: servicesCount,
        quotes: totalQuotes,
        serviceOrders: totalServiceOrders,
      },
      quotes: {
        total: totalQuotes,
        totalValue: totalQuotesValue,
        byStatus: quotesStatsByStatus,
      },
      serviceOrders: {
        total: totalServiceOrders,
        byStatus: ordersStatsByStatus,
      },
      revenue: {
        monthly: this.toNumber(monthlyRevenue._sum.amount),
        yearly: this.toNumber(yearlyRevenue._sum.amount),
        last30Days: this.toNumber(last30DaysRevenue._sum.amount),
      },
      recent: {
        quotes: recentQuotes,
        serviceOrders: recentServiceOrders,
      },
      alerts: {
        lowStockProducts: lowStockProducts.length,
        pendingQuotes: quotesStatsByStatus[QuoteStatus.PENDING]?.count || 0,
        pendingServiceOrders: ordersStatsByStatus[ServiceOrderStatus.PENDING] || 0,
      },
      lowStockProducts,
    };
  }

  /**
   * Get revenue chart data
   */
  async getRevenueChart(userId: string, userRole: string, year: number) {
    const where: any = {
      type: TransactionType.INCOME,
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    };

    // Non-admin users can only see their own data
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        date: true,
        amount: true,
      },
    });

    // Group by month
    const monthlyData: number[] = new Array(12).fill(0);

    transactions.forEach((transaction: (typeof transactions)[number]) => {
      const month = transaction.date.getMonth();
      monthlyData[month] += this.toNumber(transaction.amount);
    });

    return {
      year,
      data: monthlyData.map((amount, index) => ({
        month: index + 1,
        amount,
      })),
    };
  }

  /**
   * Get quotes conversion rate
   */
  async getQuotesConversionRate(userId: string, userRole: string) {
    const where: any = {};

    // Non-admin users can only see their own data
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const [totalQuotes, acceptedQuotes] = await Promise.all([
      prisma.quote.count({ where }),
      prisma.quote.count({
        where: {
          ...where,
          status: QuoteStatus.APPROVED,
        },
      }),
    ]);

    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    return {
      total: totalQuotes,
      accepted: acceptedQuotes,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Get top clients by revenue
   */
  async getTopClients(userId: string, userRole: string, limit: number = 10) {
    const where: any = {
      status: QuoteStatus.APPROVED,
    };

    // Non-admin users can only see their own data
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const quotes = await prisma.quote.findMany({
      where,
      select: {
        clientId: true,
        totalValue: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Group by client
    const clientRevenue = quotes.reduce<Record<string, { client: (typeof quotes)[number]['client']; totalRevenue: number; quotesCount: number }>>((acc, quote) => {
      const clientId = quote.clientId;
      if (!acc[clientId]) {
        acc[clientId] = {
          client: quote.client,
          totalRevenue: 0,
          quotesCount: 0,
        };
      }
      acc[clientId].totalRevenue += this.toNumber(quote.totalValue);
      acc[clientId].quotesCount += 1;
      return acc;
    }, {});

    // Sort by revenue and limit
    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return topClients;
  }
}

export const dashboardService = new DashboardService();
