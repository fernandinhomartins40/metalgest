import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';

export class ProductsService {
  /**
   * List all products with pagination and filters
   */
  async listProducts(
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

    // Non-admin users can only see their own products
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own products
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const product = await prisma.product.findFirst({
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

    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(
    userId: string,
    data: {
      code?: string;
      name: string;
      description?: string;
      category?: string;
      unit?: string;
      costPrice?: number;
      salePrice: number;
      stock?: number;
      minStock?: number;
      active?: boolean;
    }
  ) {
    // Check for duplicate code if provided
    if (data.code) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          code: data.code,
          userId,
        },
      });

      if (existingProduct) {
        throw new AppError(409, 'Product with this code already exists', 'PRODUCT_CODE_EXISTS');
      }
    }

    const product = await prisma.product.create({
      data: {
        userId,
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit || 'un',
        costPrice: data.costPrice || 0,
        salePrice: data.salePrice,
        stock: data.stock || 0,
        minStock: data.minStock || 0,
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

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(
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
      stock?: number;
      minStock?: number;
      active?: boolean;
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own products
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const existingProduct = await prisma.product.findFirst({ where });
    if (!existingProduct) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Check for duplicate code if it's being changed
    if (data.code && data.code !== existingProduct.code) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          code: data.code,
          userId: existingProduct.userId,
          id: { not: id },
        },
      });

      if (duplicateProduct) {
        throw new AppError(409, 'Product with this code already exists', 'PRODUCT_CODE_EXISTS');
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        stock: data.stock,
        minStock: data.minStock,
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

    return product;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only delete their own products
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const product = await prisma.product.findFirst({ where });
    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Check if product is used in any quotes
    const quoteItems = await prisma.quoteItem.count({
      where: { productId: id },
    });

    if (quoteItems > 0) {
      throw new AppError(
        400,
        'Cannot delete product that is used in quotes',
        'PRODUCT_HAS_DEPENDENCIES'
      );
    }

    await prisma.product.delete({ where: { id } });

    return { message: 'Product deleted successfully' };
  }

  /**
   * Update product stock
   */
  async updateStock(
    id: string,
    userId: string,
    userRole: string,
    data: {
      quantity: number;
      operation: 'add' | 'subtract' | 'set';
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own products
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const product = await prisma.product.findFirst({ where });
    if (!product) {
      throw new AppError(404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    let newStock = product.stock;

    switch (data.operation) {
      case 'add':
        newStock += data.quantity;
        break;
      case 'subtract':
        newStock -= data.quantity;
        if (newStock < 0) {
          throw new AppError(400, 'Insufficient stock', 'INSUFFICIENT_STOCK');
        }
        break;
      case 'set':
        newStock = data.quantity;
        break;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
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

    return updatedProduct;
  }

  /**
   * Get products low in stock
   */
  async getLowStockProducts(userId: string, userRole: string) {
    const where: any = {
      active: true,
    };

    // Non-admin users can only see their own products
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const products = await prisma.product.findMany({
      where: {
        ...where,
        stock: {
          lte: prisma.product.fields.minStock,
        },
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
      orderBy: { stock: 'asc' },
    });

    return products;
  }

  /**
   * Get product categories
   */
  async getCategories(userId: string, userRole: string) {
    const where: any = {};

    // Non-admin users can only see their own products
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const products = await prisma.product.findMany({
      where: {
        ...where,
        category: { not: null },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categories = products
      .map((product: { category: string | null }) => product.category)
      .filter((category): category is string => category !== null)
      .sort();

    return categories;
  }
}

export const productsService = new ProductsService();
