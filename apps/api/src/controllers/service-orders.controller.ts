import { Request, Response, NextFunction } from 'express';
import { serviceOrdersService } from '@/services/service-orders.service';
import { asyncHandler } from '@/middlewares/error';

export class ServiceOrdersController {
  /**
   * List all service orders
   * GET /api/service-orders
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, status, priority, clientId } = req.query;

    const result = await serviceOrdersService.listServiceOrders(req.user!.id, req.user!.role, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      status: status as any,
      priority: priority as any,
      clientId: clientId as string,
    });

    res.json(result);
  });

  /**
   * Get service order by ID
   * GET /api/service-orders/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const order = await serviceOrdersService.getServiceOrderById(id, req.user!.id, req.user!.role);
    res.json(order);
  });

  /**
   * Create new service order
   * POST /api/service-orders
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const order = await serviceOrdersService.createServiceOrder(req.user!.id, req.body);
    res.status(201).json(order);
  });

  /**
   * Update service order
   * PUT /api/service-orders/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const order = await serviceOrdersService.updateServiceOrder(
      id,
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.json(order);
  });

  /**
   * Update service order status
   * PATCH /api/service-orders/:id/status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await serviceOrdersService.updateServiceOrderStatus(
      id,
      req.user!.id,
      req.user!.role,
      status
    );
    res.json(order);
  });

  /**
   * Delete service order
   * DELETE /api/service-orders/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const result = await serviceOrdersService.deleteServiceOrder(id, req.user!.id, req.user!.role);
    res.json(result);
  });
}

export const serviceOrdersController = new ServiceOrdersController();
