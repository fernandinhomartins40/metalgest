import { Request, Response, NextFunction } from 'express';
import { transactionsService } from '@/services/transactions.service';
import { asyncHandler } from '@/middlewares/error';

export class TransactionsController {
  /**
   * List all transactions
   * GET /api/transactions
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, type, category, startDate, endDate } = req.query;

    const result = await transactionsService.listTransactions(req.user!.id, req.user!.role, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      type: type as any,
      category: category as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json(result);
  });

  /**
   * Get transaction by ID
   * GET /api/transactions/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const transaction = await transactionsService.getTransactionById(
      id,
      req.user!.id,
      req.user!.role
    );
    res.json(transaction);
  });

  /**
   * Create new transaction
   * POST /api/transactions
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const transaction = await transactionsService.createTransaction(req.user!.id, req.body);
    res.status(201).json(transaction);
  });

  /**
   * Update transaction
   * PUT /api/transactions/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const transaction = await transactionsService.updateTransaction(
      id,
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.json(transaction);
  });

  /**
   * Delete transaction
   * DELETE /api/transactions/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const result = await transactionsService.deleteTransaction(id, req.user!.id, req.user!.role);
    res.json(result);
  });

  /**
   * Get balance summary
   * GET /api/transactions/balance
   */
  balance = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const balance = await transactionsService.getBalance(req.user!.id, req.user!.role, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json(balance);
  });

  /**
   * Get summary by category
   * GET /api/transactions/summary/category
   */
  summaryByCategory = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { type, startDate, endDate } = req.query;

    const summary = await transactionsService.getSummaryByCategory(req.user!.id, req.user!.role, {
      type: type as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json(summary);
  });

  /**
   * Get summary by month
   * GET /api/transactions/summary/month
   */
  summaryByMonth = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { year } = req.query;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const summary = await transactionsService.getSummaryByMonth(
      req.user!.id,
      req.user!.role,
      targetYear
    );

    res.json(summary);
  });
}

export const transactionsController = new TransactionsController();
