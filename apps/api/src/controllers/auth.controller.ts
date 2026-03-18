import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { asyncHandler } from '@/middlewares/error';

export class AuthController {
  private getRefreshTokenFromRequest(req: Request) {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const refreshCookie = cookieHeader
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('refresh_token='));

      if (refreshCookie) {
        return decodeURIComponent(refreshCookie.split('=')[1] || '');
      }
    }

    return req.body?.refreshToken;
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/api/auth',
    });
  }

  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    this.setRefreshCookie(res, result.refreshToken);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    this.setRefreshCookie(res, result.refreshToken);
    res.json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshToken = this.getRefreshTokenFromRequest(req);
    const result = await authService.refresh(refreshToken);
    this.setRefreshCookie(res, result.refreshToken);
    res.json(result);
  });

  logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshToken = this.getRefreshTokenFromRequest(req);
    await authService.logout(refreshToken);
    this.clearRefreshCookie(res);
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
