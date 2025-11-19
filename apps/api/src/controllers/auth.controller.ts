import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { asyncHandler } from '@/middlewares/error';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  });

  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  });

  me = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json(user);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    res.json(user);
  });

  changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  });
}

export const authController = new AuthController();
