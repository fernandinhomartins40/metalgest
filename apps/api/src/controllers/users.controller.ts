import { Request, Response, NextFunction } from 'express';
import { usersService } from '@/services/users.service';
import { asyncHandler } from '@/middlewares/error';

export class UsersController {
  /**
   * List all users
   * GET /api/users
   */
  list = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { page, limit, search, role, active } = req.query;

    const result = await usersService.listUsers({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      role: role as any,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    });

    res.json(result);
  });

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  get = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const user = await usersService.getUserById(id);
    res.json(user);
  });

  /**
   * Create new user
   * POST /api/users
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, name, password, role, active } = req.body;
    const user = await usersService.createUser({
      email,
      name,
      password,
      role,
      active,
    });
    res.status(201).json(user);
  });

  /**
   * Update user
   * PUT /api/users/:id
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { name, email, role, active, emailVerified } = req.body;
    const user = await usersService.updateUser(id, {
      name,
      email,
      role,
      active,
      emailVerified,
    });
    res.json(user);
  });

  /**
   * Reset user password
   * POST /api/users/:id/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const result = await usersService.resetPassword(id, newPassword);
    res.json(result);
  });

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const result = await usersService.deleteUser(id);
    res.json(result);
  });

  /**
   * Get user statistics
   * GET /api/users/:id/stats
   */
  stats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const stats = await usersService.getUserStats(id);
    res.json(stats);
  });
}

export const usersController = new UsersController();
