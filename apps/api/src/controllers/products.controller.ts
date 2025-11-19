import { Request, Response, NextFunction } from 'express';
import { productsService } from '@/services/products.service';
import { asyncHandler } from '@/middlewares/error';

export class ProductsController {
  /**
   * List all products
   * GET /api/products
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, active, category } = req.query;

    const result = await productsService.listProducts(req.user!.id, req.user!.role, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      category: category as string,
    });

    res.json(result);
  });

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const product = await productsService.getProductById(id, req.user!.id, req.user!.role);
    res.json(product);
  });

  /**
   * Create new product
   * POST /api/products
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const product = await productsService.createProduct(req.user!.id, req.body);
    res.status(201).json(product);
  });

  /**
   * Update product
   * PUT /api/products/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const product = await productsService.updateProduct(id, req.user!.id, req.user!.role, req.body);
    res.json(product);
  });

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const result = await productsService.deleteProduct(id, req.user!.id, req.user!.role);
    res.json(result);
  });

  /**
   * Update product stock
   * PATCH /api/products/:id/stock
   */
  updateStock = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { quantity, operation } = req.body;
    const product = await productsService.updateStock(id, req.user!.id, req.user!.role, {
      quantity,
      operation,
    });
    res.json(product);
  });

  /**
   * Get products low in stock
   * GET /api/products/low-stock
   */
  lowStock = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const products = await productsService.getLowStockProducts(req.user!.id, req.user!.role);
    res.json(products);
  });

  /**
   * Get product categories
   * GET /api/products/categories
   */
  categories = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const categories = await productsService.getCategories(req.user!.id, req.user!.role);
    res.json(categories);
  });
}

export const productsController = new ProductsController();
