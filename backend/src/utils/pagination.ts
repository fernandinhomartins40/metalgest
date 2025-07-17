import { PaginationParams, PaginatedResponse } from '@/types';

export class PaginationUtil {
  static DEFAULT_PAGE = 1;
  static DEFAULT_LIMIT = 10;
  static MAX_LIMIT = 100;

  static getPaginationParams(query: any): PaginationParams {
    const page = Math.max(1, parseInt(query.page) || this.DEFAULT_PAGE);
    const limit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, parseInt(query.limit) || this.DEFAULT_LIMIT)
    );
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return { page, limit, sortBy, sortOrder };
  }

  static getSkipTake(page: number, limit: number): { skip: number; take: number } {
    const skip = (page - 1) * limit;
    const take = limit;
    
    return { skip, take };
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  static getSortOrder(sortBy: string, sortOrder: 'asc' | 'desc'): any {
    return { [sortBy]: sortOrder };
  }
}

export default PaginationUtil;