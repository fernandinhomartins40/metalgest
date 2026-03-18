import { prisma } from '@/config/database';

type AuditRecordInput = {
  userId?: string | null;
  action: string;
  module: string;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export class AuditService {
  async record(input: AuditRecordInput) {
    return prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        module: input.module,
        details: input.details as object | undefined,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });
  }

  async listLogs(
    userId: string,
    userRole: string,
    params: {
      page?: number;
      limit?: number;
      module?: string;
      action?: string;
      targetUserId?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (userRole !== 'ADMIN') {
      where.userId = userId;
    } else if (params.targetUserId) {
      where.userId = params.targetUserId;
    }

    if (params.module) {
      where.module = params.module;
    }

    if (params.action) {
      where.action = params.action;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();
