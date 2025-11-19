import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export class UsersService {
  /**
   * List all users with pagination and filters
   */
  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    active?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.role) {
      where.role = params.role;
    }

    if (params.active !== undefined) {
      where.active = params.active;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              clients: true,
              products: true,
              services: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clients: true,
            products: true,
            services: true,
            quotes: true,
            serviceOrders: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
    active?: boolean;
  }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already in use', 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role || UserRole.USER,
        active: data.active !== undefined ? data.active : true,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: UserRole;
      active?: boolean;
      emailVerified?: boolean;
    }
  ) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Check if email is being changed and is already in use
    if (data.email && data.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailInUse) {
        throw new AppError(409, 'Email already in use', 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        active: data.active,
        emailVerified: data.emailVerified,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Reset user password (admin only)
   */
  async resetPassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Delete user (cascade will handle related records based on schema)
    await prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  /**
   * Get user statistics
   */
  async getUserStats(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clients: true,
            products: true,
            services: true,
            quotes: true,
            serviceOrders: true,
            transactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    // Get transaction totals
    const transactionStats = await prisma.transaction.aggregate({
      where: { userId: id },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get quotes stats
    const quotesStats = await prisma.quote.groupBy({
      by: ['status'],
      where: { userId: id },
      _count: true,
      _sum: {
        totalValue: true,
      },
    });

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      counts: user._count,
      transactions: {
        total: transactionStats._count,
        totalAmount: transactionStats._sum.amount || 0,
      },
      quotes: quotesStats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count,
          totalValue: stat._sum.totalValue || 0,
        };
        return acc;
      }, {} as any),
    };
  }
}

export const usersService = new UsersService();
