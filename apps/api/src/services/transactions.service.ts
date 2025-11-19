import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import { TransactionType, TransactionCategory } from '@prisma/client';

export class TransactionsService {
  /**
   * List all transactions with pagination and filters
   */
  async listTransactions(
    userId: string,
    userRole: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: TransactionType;
      category?: TransactionCategory;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can only see their own transactions
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params.search) {
      where.OR = [
        { description: { contains: params.search, mode: 'insensitive' } },
        { notes: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = params.startDate;
      }
      if (params.endDate) {
        where.date.lte = params.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own transactions
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const transaction = await prisma.transaction.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    return transaction;
  }

  /**
   * Create new transaction
   */
  async createTransaction(
    userId: string,
    data: {
      type: TransactionType;
      category: TransactionCategory;
      amount: number;
      description: string;
      date: Date;
      paymentMethod?: string;
      notes?: string;
    }
  ) {
    // Validate amount is positive
    if (data.amount <= 0) {
      throw new AppError(400, 'Amount must be positive', 'INVALID_AMOUNT');
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return transaction;
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    id: string,
    userId: string,
    userRole: string,
    data: {
      type?: TransactionType;
      category?: TransactionCategory;
      amount?: number;
      description?: string;
      date?: Date;
      paymentMethod?: string;
      notes?: string;
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own transactions
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const existingTransaction = await prisma.transaction.findFirst({ where });
    if (!existingTransaction) {
      throw new AppError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    // Validate amount if being changed
    if (data.amount !== undefined && data.amount <= 0) {
      throw new AppError(400, 'Amount must be positive', 'INVALID_AMOUNT');
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return transaction;
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only delete their own transactions
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const transaction = await prisma.transaction.findFirst({ where });
    if (!transaction) {
      throw new AppError(404, 'Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    await prisma.transaction.delete({ where: { id } });

    return { message: 'Transaction deleted successfully' };
  }

  /**
   * Get balance summary
   */
  async getBalance(userId: string, userRole: string, params?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    // Non-admin users can only see their own balance
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params?.startDate || params?.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = params.startDate;
      }
      if (params.endDate) {
        where.date.lte = params.endDate;
      }
    }

    // Get income transactions
    const income = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: TransactionType.INCOME,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get expense transactions
    const expenses = await prisma.transaction.aggregate({
      where: {
        ...where,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    return {
      income: {
        total: totalIncome,
        count: income._count,
      },
      expenses: {
        total: totalExpenses,
        count: expenses._count,
      },
      balance,
    };
  }

  /**
   * Get transactions summary by category
   */
  async getSummaryByCategory(
    userId: string,
    userRole: string,
    params?: {
      type?: TransactionType;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = {};

    // Non-admin users can only see their own summary
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params?.type) {
      where.type = params.type;
    }

    if (params?.startDate || params?.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = params.startDate;
      }
      if (params.endDate) {
        where.date.lte = params.endDate;
      }
    }

    const summary = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where,
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    return summary.map((item) => ({
      category: item.category,
      type: item.type,
      total: item._sum.amount || 0,
      count: item._count,
    }));
  }

  /**
   * Get transactions summary by month
   */
  async getSummaryByMonth(userId: string, userRole: string, year: number) {
    const where: any = {
      date: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    };

    // Non-admin users can only see their own summary
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        date: true,
        type: true,
        amount: true,
      },
    });

    // Group by month
    const monthlyData: Record<number, { income: number; expenses: number; balance: number }> = {};

    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = { income: 0, expenses: 0, balance: 0 };
    }

    transactions.forEach((transaction) => {
      const month = transaction.date.getMonth() + 1;
      if (transaction.type === TransactionType.INCOME) {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });

    // Calculate balance for each month
    Object.keys(monthlyData).forEach((month) => {
      const monthNum = parseInt(month);
      monthlyData[monthNum].balance = monthlyData[monthNum].income - monthlyData[monthNum].expenses;
    });

    return Object.keys(monthlyData).map((month) => ({
      month: parseInt(month),
      ...monthlyData[parseInt(month)],
    }));
  }
}

export const transactionsService = new TransactionsService();
