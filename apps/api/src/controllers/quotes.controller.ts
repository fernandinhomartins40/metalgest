import { Request, Response, NextFunction } from 'express';
import { quotesService } from '@/services/quotes.service';
import { asyncHandler } from '@/middlewares/error';

export class QuotesController {
  /**
   * List all quotes
   * GET /api/quotes
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, status, clientId } = req.query;

    const result = await quotesService.listQuotes(req.user!.id, req.user!.role, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      status: status as any,
      clientId: clientId as string,
    });

    res.json(result);
  });

  /**
   * Get quote by ID
   * GET /api/quotes/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const quote = await quotesService.getQuoteById(id, req.user!.id, req.user!.role);
    res.json(quote);
  });

  /**
   * Get quote by public token
   * GET /api/quotes/public/:token
   */
  getPublic = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const token = String(req.params.token);
    const quote = await quotesService.getQuoteByPublicToken(token);
    res.json(quote);
  });

  /**
   * Update quote status by public token
   * PATCH /api/quotes/public/:token/status
   */
  updatePublicStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const token = String(req.params.token);
    const { status } = req.body;
    const quote = await quotesService.updateQuoteStatusByPublicToken(token, status);
    res.json(quote);
  });

  /**
   * Create new quote
   * POST /api/quotes
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const quote = await quotesService.createQuote(req.user!.id, req.body);
    res.status(201).json(quote);
  });

  /**
   * Update quote
   * PUT /api/quotes/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const quote = await quotesService.updateQuote(id, req.user!.id, req.user!.role, req.body);
    res.json(quote);
  });

  /**
   * Update quote status
   * PATCH /api/quotes/:id/status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const { status } = req.body;
    const quote = await quotesService.updateQuoteStatus(id, req.user!.id, req.user!.role, status);
    res.json(quote);
  });

  /**
   * Toggle public link
   * PATCH /api/quotes/:id/public-link
   */
  togglePublicLink = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const { enabled } = req.body;
    const result = await quotesService.togglePublicLink(id, req.user!.id, req.user!.role, enabled);
    res.json(result);
  });

  /**
   * Delete quote
   * DELETE /api/quotes/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const result = await quotesService.deleteQuote(id, req.user!.id, req.user!.role);
    res.json(result);
  });

  /**
   * Duplicate quote
   * POST /api/quotes/:id/duplicate
   */
  duplicate = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = String(req.params.id);
    const quote = await quotesService.duplicateQuote(id, req.user!.id, req.user!.role);
    res.status(201).json(quote);
  });
}

export const quotesController = new QuotesController();
