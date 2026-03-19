import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { asyncHandler } from '@/middlewares/error';

const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

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

  private setRefreshCookie(res: Response, refreshToken: string, rememberMe = false) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/api/auth',
      ...(rememberMe ? { maxAge: REFRESH_COOKIE_MAX_AGE_MS } : {}),
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
    const { name, email, password, rememberMe } = req.body;
    const result = await authService.register(name, email, password, rememberMe !== false);

    if (result.refreshToken) {
      this.setRefreshCookie(res, result.refreshToken, result.rememberMe);
    }

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      verificationRequired: result.verificationRequired,
      emailDispatched: result.emailDispatched,
      message: result.message,
    });
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login(email, password, Boolean(rememberMe));

    this.setRefreshCookie(res, result.refreshToken, result.rememberMe);

    res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { token } = req.body;
    const result = await authService.verifyEmail(token);
    res.json(result);
  });

  resendVerification = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    const result = await authService.resendVerification(email);
    res.json(result);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(result);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    this.clearRefreshCookie(res);
    res.json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshToken = this.getRefreshTokenFromRequest(req);
    const result = await authService.refresh(refreshToken);

    this.setRefreshCookie(res, result.refreshToken, result.rememberMe);

    res.json({
      accessToken: result.accessToken,
    });
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
    this.clearRefreshCookie(res);
    res.json({ message: 'Password changed successfully' });
  });
}

export const authController = new AuthController();
