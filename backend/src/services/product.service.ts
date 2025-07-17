import { prisma } from '@/config/database';
import { AppError } from '@/middleware/errorHandler';
import { PaginationUtil } from '@/utils/pagination';
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters,
  PaginationParams,
  PaginatedResponse 
} from '@/types';

export class ProductService {
  async create(userId: string, data: CreateProductRequest): Promise<any> {
    const product = await prisma.product.create({
      data: {
        ...data,
        userId,
      },
    });

    return product;
  }

  async findAll(
    userId: string, 
    filters: ProductFilters, 
    pagination: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const { skip, take } = PaginationUtil.getSkipTake(pagination.page!, pagination.limit!);
    
    const where: any = {
      userId,
    };

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.lowStock) {
      where.stock = { lte: prisma.product.fields.minStock };
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: PaginationUtil.getSortOrder(pagination.sortBy!, pagination.sortOrder!),
      }),
      prisma.product.count({ where }),
    ]);

    return PaginationUtil.createPaginatedResponse(products, total, pagination.page!, pagination.limit!);
  }

  async findById(id: string, userId: string): Promise<any> {
    const product = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  async update(id: string, userId: string, data: UpdateProductRequest): Promise<any> {
    const existingProduct = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return product;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existingProduct = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    // Check if product is used in any quotes
    const quotesWithProduct = await prisma.quoteItem.findFirst({
      where: { productId: id },
    });

    if (quotesWithProduct) {
      throw new AppError('Cannot delete product that is used in quotes', 400);
    }

    await prisma.product.delete({
      where: { id },
    });
  }

  async search(userId: string, term: string, category?: string): Promise<any[]> {
    const where: any = {
      userId,
      active: true,
    };

    if (term) {
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50, // Limit search results
    });

    return products;
  }

  async getLowStockProducts(userId: string): Promise<any[]> {
    const products = await prisma.product.findMany({
      where: {
        userId,
        active: true,
        stock: { lte: prisma.product.fields.minStock },
      },
      orderBy: { stock: 'asc' },
    });

    return products;
  }

  async getCategories(userId: string): Promise<string[]> {
    const categories = await prisma.product.findMany({
      where: { userId, active: true },
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map(c => c.category);
  }

  async updateStock(id: string, userId: string, quantity: number): Promise<any> {
    const product = await prisma.product.findFirst({
      where: { id, userId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new AppError('Insufficient stock', 400);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });

    return updatedProduct;
  }

  async bulkUpdateStock(userId: string, updates: { id: string; quantity: number }[]): Promise<void> {
    const products = await prisma.product.findMany({
      where: {
        id: { in: updates.map(u => u.id) },
        userId,
      },
    });

    if (products.length !== updates.length) {
      throw new AppError('Some products not found', 404);
    }

    const updatePromises = updates.map(update => {
      const product = products.find(p => p.id === update.id);
      const newStock = product!.stock + update.quantity;

      if (newStock < 0) {
        throw new AppError(`Insufficient stock for product ${product!.name}`, 400);
      }

      return prisma.product.update({
        where: { id: update.id },
        data: { stock: newStock },
      });
    });

    await Promise.all(updatePromises);
  }
}

export const productService = new ProductService();
export default productService;