import { Request, Response, NextFunction } from 'express';
import { clientsService } from '@/services/clients.service';
import { asyncHandler } from '@/middlewares/error';

export class ClientsController {
  /**
   * List all clients
   * GET /api/clients
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, type, active } = req.query;

    const result = await clientsService.listClients(req.user!.id, req.user!.role, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      type: type as any,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    });

    res.json(result);
  });

  /**
   * Get client by ID
   * GET /api/clients/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const client = await clientsService.getClientById(id, req.user!.id, req.user!.role);
    res.json(client);
  });

  /**
   * Create new client
   * POST /api/clients
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const client = await clientsService.createClient(req.user!.id, req.body);
    res.status(201).json(client);
  });

  /**
   * Update client
   * PUT /api/clients/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const client = await clientsService.updateClient(id, req.user!.id, req.user!.role, req.body);
    res.json(client);
  });

  /**
   * Delete client
   * DELETE /api/clients/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const result = await clientsService.deleteClient(id, req.user!.id, req.user!.role);
    res.json(result);
  });

  /**
   * Get client statistics
   * GET /api/clients/:id/stats
   */
  stats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const stats = await clientsService.getClientStats(id, req.user!.id, req.user!.role);
    res.json(stats);
  });
}

export const clientsController = new ClientsController();
