import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import { QuoteStatus } from '@prisma/client';
import crypto from 'crypto';

export class QuotesService {
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
   * Generate unique quote number
   */
  private async generateQuoteNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.quote.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
        },
      },
    });
    const number = String(count + 1).padStart(4, '0');
    return `ORC-${year}-${number}`;
  }

  /**
   * Generate public link token
   */
  private generatePublicToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * List all quotes with pagination and filters
   */
  async listQuotes(
    userId: string,
    userRole: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: QuoteStatus;
      clientId?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admin users can only see their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    if (params.search) {
      where.OR = [
        { quoteNumber: { contains: params.search, mode: 'insensitive' } },
        { client: { name: { contains: params.search, mode: 'insensitive' } } },
        { notes: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.clientId) {
      where.clientId = params.clientId;
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
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
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              service: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only access their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const quote = await prisma.quote.findFirst({
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
        items: {
          include: {
            product: true,
            service: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!quote) {
      throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
    }

    return quote;
  }

  /**
   * Get quote by public token (no authentication required)
   */
  async getQuoteByPublicToken(token: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        publicToken: token,
        publicLinkEnabled: true,
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
        items: {
          include: {
            product: true,
            service: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!quote) {
      throw new AppError(404, 'Quote not found or link is disabled', 'QUOTE_NOT_FOUND');
    }

    return quote;
  }

  /**
   * Update quote status through public link
   */
  async updateQuoteStatusByPublicToken(token: string, status: QuoteStatus) {
    if (status !== QuoteStatus.APPROVED && status !== QuoteStatus.REJECTED) {
      throw new AppError(400, 'Invalid public quote status', 'INVALID_STATUS');
    }

    const quote = await prisma.quote.findFirst({
      where: {
        publicToken: token,
        publicLinkEnabled: true,
      },
    });

    if (!quote) {
      throw new AppError(404, 'Quote not found or link is disabled', 'QUOTE_NOT_FOUND');
    }

    return prisma.quote.update({
      where: { id: quote.id },
      data: { status },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
            service: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Create new quote
   */
  async createQuote(
    userId: string,
    data: {
      clientId: string;
      validUntil?: Date;
      discount?: number;
      tax?: number;
      notes?: string;
      termsAndConditions?: string;
      items: Array<{
        productId?: string;
        serviceId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
    }
  ) {
    // Validate client exists and belongs to user (if not admin)
    const client = await prisma.client.findFirst({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new AppError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new AppError(400, 'Quote must have at least one item', 'INVALID_ITEMS');
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = data.discount || 0;
    const taxAmount = data.tax || 0;
    const totalValue = subtotal - discountAmount + taxAmount;

    // Generate quote number
    const quoteNumber = await this.generateQuoteNumber(userId);

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        userId,
        clientId: data.clientId,
        quoteNumber,
        validUntil: data.validUntil,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        totalValue,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        status: QuoteStatus.DRAFT,
        publicToken: this.generatePublicToken(),
        publicLinkEnabled: false,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            serviceId: item.serviceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
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
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    return quote;
  }

  /**
   * Update quote
   */
  async updateQuote(
    id: string,
    userId: string,
    userRole: string,
    data: {
      clientId?: string;
      validUntil?: Date;
      discount?: number;
      tax?: number;
      notes?: string;
      termsAndConditions?: string;
      status?: QuoteStatus;
      items?: Array<{
        productId?: string;
        serviceId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
    }
  ) {
    const where: any = { id };

    // Non-admin users can only update their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const existingQuote = await prisma.quote.findFirst({ where });
    if (!existingQuote) {
      throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
    }

    // If items are being updated, delete old items and create new ones
    let itemsUpdate = {};
    let subtotal = this.toNumber(existingQuote.subtotal);
    let totalValue = this.toNumber(existingQuote.totalValue);

    if (data.items && data.items.length > 0) {
      subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const discountAmount =
        data.discount !== undefined ? data.discount : this.toNumber(existingQuote.discount);
      const taxAmount = data.tax !== undefined ? data.tax : this.toNumber(existingQuote.tax);
      totalValue = subtotal - discountAmount + taxAmount;

      itemsUpdate = {
        deleteMany: {},
        create: data.items.map((item) => ({
          productId: item.productId,
          serviceId: item.serviceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      };
    } else if (data.discount !== undefined || data.tax !== undefined) {
      // Recalculate total if discount or tax changed
      const discountAmount =
        data.discount !== undefined ? data.discount : this.toNumber(existingQuote.discount);
      const taxAmount = data.tax !== undefined ? data.tax : this.toNumber(existingQuote.tax);
      totalValue = subtotal - discountAmount + taxAmount;
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        clientId: data.clientId,
        validUntil: data.validUntil,
        subtotal,
        discount: data.discount,
        tax: data.tax,
        totalValue,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        status: data.status,
        items: itemsUpdate,
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
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    return quote;
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(id: string, userId: string, userRole: string, status: QuoteStatus) {
    const where: any = { id };

    // Non-admin users can only update their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const quote = await prisma.quote.findFirst({ where });
    if (!quote) {
      throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    return updatedQuote;
  }

  /**
   * Enable/disable public link
   */
  async togglePublicLink(id: string, userId: string, userRole: string, enabled: boolean) {
    const where: any = { id };

    // Non-admin users can only update their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const quote = await prisma.quote.findFirst({ where });
    if (!quote) {
      throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
    }

    // Regenerate token if enabling
    const publicToken = enabled ? this.generatePublicToken() : quote.publicToken;

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        publicLinkEnabled: enabled,
        publicToken,
      },
      select: {
        id: true,
        publicToken: true,
        publicLinkEnabled: true,
      },
    });

    return updatedQuote;
  }

  /**
   * Delete quote
   */
  async deleteQuote(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only delete their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const quote = await prisma.quote.findFirst({ where });
    if (!quote) {
      throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
    }

    // Delete quote (cascade will delete items)
    await prisma.quote.delete({ where: { id } });

    return { message: 'Quote deleted successfully' };
  }

  /**
   * Duplicate quote
   */
  async duplicateQuote(id: string, userId: string, userRole: string) {
    const where: any = { id };

    // Non-admin users can only duplicate their own quotes
    if (userRole !== 'ADMIN') {
      where.userId = userId;
    }

    const originalQuote = await prisma.quote.findFirst({
      where,
      include: {
        items: true,
      },
    });

    if (!originalQuote) {
      throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND');
    }

    // Generate new quote number
    const quoteNumber = await this.generateQuoteNumber(userId);

    // Create duplicate
    const duplicateQuote = await prisma.quote.create({
      data: {
        userId: originalQuote.userId,
        clientId: originalQuote.clientId,
        quoteNumber,
        validUntil: originalQuote.validUntil,
        subtotal: originalQuote.subtotal,
        discount: originalQuote.discount,
        tax: originalQuote.tax,
        totalValue: originalQuote.totalValue,
        notes: originalQuote.notes,
        termsAndConditions: originalQuote.termsAndConditions,
        status: QuoteStatus.DRAFT,
        publicToken: this.generatePublicToken(),
        publicLinkEnabled: false,
        items: {
          create: originalQuote.items.map((item: (typeof originalQuote.items)[number]) => ({
            productId: item.productId,
            serviceId: item.serviceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
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
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
    });

    return duplicateQuote;
  }
}

export const quotesService = new QuotesService();
