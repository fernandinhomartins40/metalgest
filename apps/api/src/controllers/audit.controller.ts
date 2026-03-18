import { Request, Response, NextFunction } from 'express';
import { auditService } from '@/services/audit.service';
import { asyncHandler } from '@/middlewares/error';

export class AuditController {
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, module, action, userId } = req.query;

    const result = await auditService.listLogs(req.user!.id, req.user!.role, {
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      module: module ? String(module) : undefined,
      action: action ? String(action) : undefined,
      targetUserId: userId ? String(userId) : undefined,
    });

    res.json(result);
  });
}

export const auditController = new AuditController();
