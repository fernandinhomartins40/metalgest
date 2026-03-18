import { Request, Response, NextFunction } from 'express';
import { servicesService } from '@/services/services.service';
import { asyncHandler } from '@/middlewares/error';

export class ServicesController {
  /**
   * List all services
   * GET /api/services
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, active, category } = req.query;

    const result = await servicesService.listServices(req.user!.id, req.user!.role, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      category: category as string,
    });

    res.json(result);
  });

  /**
   * Get service by ID
   * GET /api/services/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const service = await servicesService.getServiceById(id, req.user!.id, req.user!.role);
    res.json(service);
  });

  /**
   * Create new service
   * POST /api/services
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const service = await servicesService.createService(req.user!.id, req.body);
    res.status(201).json(service);
  });

  /**
   * Update service
   * PUT /api/services/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const service = await servicesService.updateService(id, req.user!.id, req.user!.role, req.body);
    res.json(service);
  });

  /**
   * Delete service
   * DELETE /api/services/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const result = await servicesService.deleteService(id, req.user!.id, req.user!.role);
    res.json(result);
  });

  /**
   * Get service categories
   * GET /api/services/categories
   */
  categories = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const categories = await servicesService.getCategories(req.user!.id, req.user!.role);
    res.json(categories);
  });
}

export const servicesController = new ServicesController();
