import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';

export class ServicesService {
  /**
   * List all services with pagination and filters
   */
  async listServices(
    userId: string,
    userRole: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      active?: boolean;
      category?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can only see their own services
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { code: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.active !== undefined) {
      where.active = params.active;
    }

    if (params.category) {
      where.category = { contains: params.category, mode: 'insensitive' };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
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
              quoteItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own services
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const service = await prisma.service.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quoteItems: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            quote: {
              select: {
                id: true,
                quoteNumber: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            quoteItems: true,
          },
        },
      },
    });

    if (!service) {
      throw new AppError(404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    return service;
  }

  /**
   * Create new service
   */
  async createService(
    userId: string,
    data: {
      code?: string;
      name: string;
      description?: string;
      category?: string;
      unit?: string;
      costPrice?: number;
      salePrice: number;
      estimatedDuration?: number;
      active?: boolean;
    }
  ) {
    // Check for duplicate code if provided
    if (data.code) {
      const existingService = await prisma.service.findFirst({
        where: {
          code: data.code,
          userId,
        },
      });

      if (existingService) {
        throw new AppError(409, 'Service with this code already exists', 'SERVICE_CODE_EXISTS');
      }
    }

    const service = await prisma.service.create({
      data: {
        userId,
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit || 'h',
        costPrice: data.costPrice || 0,
        salePrice: data.salePrice,
        estimatedDuration: data.estimatedDuration,
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

    return service;
  }

  /**
   * Update service
   */
  async updateService(
    id: string,
    userId: string,
    userRole: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
      category?: string;
      unit?: string;
      costPrice?: number;
      salePrice?: number;
      estimatedDuration?: number;
      active?: boolean;
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own services
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const existingService = await prisma.service.findFirst({ where });
    if (!existingService) {
      throw new AppError(404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    // Check for duplicate code if it's being changed
    if (data.code && data.code !== existingService.code) {
      const duplicateService = await prisma.service.findFirst({
        where: {
          code: data.code,
          userId: existingService.userId,
          id: { not: id },
        },
      });

      if (duplicateService) {
        throw new AppError(409, 'Service with this code already exists', 'SERVICE_CODE_EXISTS');
      }
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        estimatedDuration: data.estimatedDuration,
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

    return service;
  }

  /**
   * Delete service
   */
  async deleteService(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only delete their own services
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const service = await prisma.service.findFirst({ where });
    if (!service) {
      throw new AppError(404, 'Service not found', 'SERVICE_NOT_FOUND');
    }

    // Check if service is used in any quotes
    const quoteItems = await prisma.quoteItem.count({
      where: { serviceId: id },
    });

    if (quoteItems > 0) {
      throw new AppError(
        400,
        'Cannot delete service that is used in quotes',
        'SERVICE_HAS_DEPENDENCIES'
      );
    }

    await prisma.service.delete({ where: { id } });

    return { message: 'Service deleted successfully' };
  }

  /**
   * Get service categories
   */
  async getCategories(userId: string, userRole: string) {
    const where: any = {};

    // Non-admin users can only see their own services
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const services = await prisma.service.findMany({
      where: {
        ...where,
        category: { not: null },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = services
      .map((s) => s.category)
      .filter((c): c is string => c !== null)
      .sort();

    return categories;
  }
}

export const servicesService = new ServicesService();
