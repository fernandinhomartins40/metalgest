import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import { ClientType } from '@prisma/client';

export class ClientsService {
  /**
   * List all clients with pagination and filters
   */
  async listClients(
    userId: string,
    userRole: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      type?: ClientType;
      active?: boolean;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can only see their own clients
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { document: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.active !== undefined) {
      where.active = params.active;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
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
          _count: {
            select: {
              quotes: true,
              serviceOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get client by ID
   */
  async getClientById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own clients
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const client = await prisma.client.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            quoteNumber: true,
            totalValue: true,
            status: true,
            createdAt: true,
          },
        },
        serviceOrders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            quotes: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!client) {
      throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    return client;
  }

  /**
   * Create new client
   */
  async createClient(
    userId: string,
    data: {
      type: ClientType;
      name: string;
      email?: string;
      phone?: string;
      document?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      notes?: string;
      active?: boolean;
    }
  ) {
    // Check for duplicate document if provided
    if (data.document) {
      const existingClient = await prisma.client.findFirst({
        where: {
          document: data.document,
          userId,
        },
      });

      if (existingClient) {
        throw new AppError(409, 'Client with this document already exists', 'CLIENT_DOCUMENT_EXISTS');
      }
    }

    const client = await prisma.client.create({
      data: {
        userId,
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || 'Brasil',
        notes: data.notes,
        active: data.active !== undefined ? data.active : true,
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

    return client;
  }

  /**
   * Update client
   */
  async updateClient(
    id: string,
    userId: string,
    userRole: string,
    data: {
      type?: ClientType;
      name?: string;
      email?: string;
      phone?: string;
      document?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      notes?: string;
      active?: boolean;
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own clients
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const existingClient = await prisma.client.findFirst({ where });
    if (!existingClient) {
      throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    // Check for duplicate document if it's being changed
    if (data.document && data.document !== existingClient.document) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          document: data.document,
          userId: existingClient.userId,
          id: { not: id },
        },
      });

      if (duplicateClient) {
        throw new AppError(409, 'Client with this document already exists', 'CLIENT_DOCUMENT_EXISTS');
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        document: data.document,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        notes: data.notes,
        active: data.active,
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

    return client;
  }

  /**
   * Delete client
   */
  async deleteClient(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only delete their own clients
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const client = await prisma.client.findFirst({ where });
    if (!client) {
      throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    // Check if client has related quotes or service orders
    const relatedData = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quotes: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (relatedData && (relatedData._count.quotes > 0 || relatedData._count.serviceOrders > 0)) {
      throw new AppError(
        400,
        'Cannot delete client with existing quotes or service orders',
        'CLIENT_HAS_DEPENDENCIES'
      );
    }

    await prisma.client.delete({ where: { id } });

    return { message: 'Client deleted successfully' };
  }

  /**
   * Get client statistics
   */
  async getClientStats(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own clients
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const client = await prisma.client.findFirst({
      where,
      include: {
        _count: {
          select: {
            quotes: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!client) {
      throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    // Get quotes stats
    const quotesStats = await prisma.quote.groupBy({
      by: ['status'],
      where: { clientId: id },
      _count: true,
      _sum: {
        totalValue: true,
      },
    });

    // Get service orders stats
    const ordersStats = await prisma.serviceOrder.groupBy({
      by: ['status'],
      where: { clientId: id },
      _count: true,
    });

    return {
      clientId: client.id,
      name: client.name,
      type: client.type,
      counts: client._count,
      quotes: quotesStats.reduce<Record<string, { count: number; totalValue: unknown }>>((acc, stat) => {
        acc[stat.status] = {
          count: stat._count,
          totalValue: stat._sum.totalValue || 0,
        };
        return acc;
      }, {}),
      serviceOrders: ordersStats.reduce<Record<string, number>>((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {}),
    };
  }
}

export const clientsService = new ClientsService();
