import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '@/services/dashboard.service';
import { asyncHandler } from '@/middlewares/error';

export class DashboardController {
  /**
   * Get dashboard statistics
   * GET /api/dashboard/stats
   */
  stats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const stats = await dashboardService.getDashboardStats(req.user!.id, req.user!.role);
    res.json(stats);
  });

  /**
   * Get revenue chart data
   * GET /api/dashboard/revenue-chart
   */
  revenueChart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const data = await dashboardService.getRevenueChart(req.user!.id, req.user!.role, targetYear);
    res.json(data);
  });

  /**
   * Get quotes conversion rate
   * GET /api/dashboard/quotes-conversion
   */
  quotesConversion = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const data = await dashboardService.getQuotesConversionRate(req.user!.id, req.user!.role);
    res.json(data);
  });

  /**
   * Get top clients
   * GET /api/dashboard/top-clients
   */
  topClients = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const data = await dashboardService.getTopClients(req.user!.id, req.user!.role, limitNum);
    res.json(data);
  });
}

export const dashboardController = new DashboardController();
