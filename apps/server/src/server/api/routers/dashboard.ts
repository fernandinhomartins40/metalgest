import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    const [
      totalQuotes,
      totalClients,
      totalProducts,
      totalServices,
      pendingQuotes,
      activeServiceOrders,
      monthlyIncome,
      monthlyExpenses,
    ] = await Promise.all([
      ctx.db.quote.count({
        where: { userId },
      }),
      ctx.db.client.count({
        where: { userId, active: true },
      }),
      ctx.db.product.count({
        where: { userId, active: true },
      }),
      ctx.db.service.count({
        where: { userId, active: true },
      }),
      ctx.db.quote.count({
        where: { userId, status: "PENDING" },
      }),
      ctx.db.serviceOrder.count({
        where: { userId, status: "IN_PROGRESS" },
      }),
      ctx.db.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
        },
        _sum: {
          value: true,
        },
      }),
      ctx.db.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
        },
        _sum: {
          value: true,
        },
      }),
    ]);

    return {
      totalQuotes,
      totalClients,
      totalProducts,
      totalServices,
      pendingQuotes,
      activeServiceOrders,
      monthlyRevenue: monthlyIncome._sum.value || 0,
      monthlyExpenses: monthlyExpenses._sum.value || 0,
    };
  }),

  getCharts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    
    // Get last 6 months revenue data
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const startOfMonthDate = startOfMonth(date);
      const endOfMonthDate = endOfMonth(date);
      
      const income = await ctx.db.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: startOfMonthDate,
            lte: endOfMonthDate,
          },
        },
        _sum: {
          value: true,
        },
      });

      const expense = await ctx.db.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: startOfMonthDate,
            lte: endOfMonthDate,
          },
        },
        _sum: {
          value: true,
        },
      });

      revenueData.push({
        name: format(date, "MMM yyyy"),
        income: income._sum.value || 0,
        expense: expense._sum.value || 0,
      });
    }

    // Get quote status distribution
    const quoteStatusData = await ctx.db.quote.groupBy({
      by: ["status"],
      where: { userId },
      _count: {
        status: true,
      },
    });

    const statusData = quoteStatusData.map((item) => ({
      name: item.status,
      value: item._count.status,
    }));

    // Get top products by quote usage
    const topProducts = await ctx.db.quoteItem.groupBy({
      by: ["productId"],
      where: {
        quote: { userId },
      },
      _count: {
        productId: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: 5,
    });

    const productData = await Promise.all(
      topProducts.map(async (item) => {
        const product = await ctx.db.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        return {
          name: product?.name || "Unknown",
          value: item._sum.quantity || 0,
        };
      })
    );

    return {
      revenueData,
      statusData,
      productData,
    };
  }),

  getRecentQuotes: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const quotes = await ctx.db.quote.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: {
          client: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return quotes;
    }),

  getPerformance: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const [
      currentMonthQuotes,
      lastMonthQuotes,
      currentMonthRevenue,
      lastMonthRevenue,
      currentMonthClients,
      lastMonthClients,
    ] = await Promise.all([
      ctx.db.quote.count({
        where: {
          userId,
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
        },
      }),
      ctx.db.quote.count({
        where: {
          userId,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      ctx.db.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
        },
        _sum: {
          value: true,
        },
      }),
      ctx.db.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          value: true,
        },
      }),
      ctx.db.client.count({
        where: {
          userId,
          createdAt: {
            gte: startOfCurrentMonth,
            lte: endOfCurrentMonth,
          },
        },
      }),
      ctx.db.client.count({
        where: {
          userId,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      quotes: {
        current: currentMonthQuotes,
        previous: lastMonthQuotes,
        growth: calculateGrowth(currentMonthQuotes, lastMonthQuotes),
      },
      revenue: {
        current: currentMonthRevenue._sum.value || 0,
        previous: lastMonthRevenue._sum.value || 0,
        growth: calculateGrowth(
          Number(currentMonthRevenue._sum.value) || 0,
          Number(lastMonthRevenue._sum.value) || 0
        ),
      },
      clients: {
        current: currentMonthClients,
        previous: lastMonthClients,
        growth: calculateGrowth(currentMonthClients, lastMonthClients),
      },
    };
  }),
});