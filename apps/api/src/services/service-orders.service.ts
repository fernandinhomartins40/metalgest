import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import { ServiceOrderStatus, ServiceOrderPriority } from '@prisma/client';

export class ServiceOrdersService {
  /**
   * Generate unique order number
   */
  private async generateOrderNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.serviceOrder.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
        },
      },
    });
    const number = String(count + 1).padStart(4, '0');
    return `OS-${year}-${number}`;
  }

  /**
   * List all service orders with pagination and filters
   */
  async listServiceOrders(
    userId: string,
    userRole: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ServiceOrderStatus;
      priority?: ServiceOrderPriority;
      clientId?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can only see their own orders
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search, mode: 'insensitive' } },
        { client: { name: { contains: params.search, mode: 'insensitive' } } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    if (params.clientId) {
      where.clientId = params.clientId;
    }

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              totalValue: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get service order by ID
   */
  async getServiceOrderById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own orders
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const order = await prisma.serviceOrder.findFirst({
      where,
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          include: {
            items: {
              include: {
                product: true,
                service: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Service order not found', 'SERVICE_ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Create new service order
   */
  async createServiceOrder(
    userId: string,
    data: {
      clientId: string;
      quoteId?: string;
      description: string;
      priority?: ServiceOrderPriority;
      startDate?: Date;
      estimatedEndDate?: Date;
      notes?: string;
    }
  ) {
    // Validate client exists
    const client = await prisma.client.findFirst({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    // Validate quote if provided
    if (data.quoteId) {
      const quote = await prisma.quote.findFirst({
        where: { id: data.quoteId },
      });

      if (!quote) {
        throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
      }

      // Check if quote belongs to the same client
      if (quote.clientId !== data.clientId) {
        throw new AppError(400, 'Quote does not belong to this client', 'INVALID_QUOTE');
      }
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber(userId);

    // Create service order
    const order = await prisma.serviceOrder.create({
      data: {
        userId,
        clientId: data.clientId,
        quoteId: data.quoteId,
        orderNumber,
        description: data.description,
        priority: data.priority || ServiceOrderPriority.MEDIUM,
        status: ServiceOrderStatus.PENDING,
        startDate: data.startDate,
        estimatedEndDate: data.estimatedEndDate,
        notes: data.notes,
      },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            totalValue: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Update service order
   */
  async updateServiceOrder(
    id: string,
    userId: string,
    userRole: string,
    data: {
      clientId?: string;
      quoteId?: string;
      description?: string;
      priority?: ServiceOrderPriority;
      status?: ServiceOrderStatus;
      startDate?: Date;
      estimatedEndDate?: Date;
      actualEndDate?: Date;
      notes?: string;
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own orders
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const existingOrder = await prisma.serviceOrder.findFirst({ where });
    if (!existingOrder) {
      throw new AppError(404, 'Service order not found', 'SERVICE_ORDER_NOT_FOUND');
    }

    // Validate client if being changed
    if (data.clientId && data.clientId !== existingOrder.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: data.clientId },
      });

      if (!client) {
        throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
      }
    }

    // Update service order
    const order = await prisma.serviceOrder.update({
      where: { id },
      data: {
        clientId: data.clientId,
        quoteId: data.quoteId,
        description: data.description,
        priority: data.priority,
        status: data.status,
        startDate: data.startDate,
        estimatedEndDate: data.estimatedEndDate,
        actualEndDate: data.actualEndDate,
        notes: data.notes,
      },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            totalValue: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Update service order status
   */
  async updateServiceOrderStatus(
    id: string,
    userId: string,
    userRole: string,
    status: ServiceOrderStatus
  ) {
    const where: any = { id };

    // Non-admin users can only update their own orders
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const order = await prisma.serviceOrder.findFirst({ where });
    if (!order) {
      throw new AppError(404, 'Service order not found', 'SERVICE_ORDER_NOT_FOUND');
    }

    const updateData: any = { status };

    // Set actualEndDate if status is COMPLETED or CANCELLED
    if (status === ServiceOrderStatus.COMPLETED || status === ServiceOrderStatus.CANCELLED) {
      updateData.actualEndDate = new Date();
    }

    const updatedOrder = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quote: {
          select: {
            id: true,
            quoteNumber: true,
            totalValue: true,
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Delete service order
   */
  async deleteServiceOrder(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only delete their own orders
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const order = await prisma.serviceOrder.findFirst({ where });
    if (!order) {
      throw new AppError(404, 'Service order not found', 'SERVICE_ORDER_NOT_FOUND');
    }

    // Delete service order
    await prisma.serviceOrder.delete({ where: { id } });

    return { message: 'Service order deleted successfully' };
  }
}

export const serviceOrdersService = new ServiceOrdersService();
