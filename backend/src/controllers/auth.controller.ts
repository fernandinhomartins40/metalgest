import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { authService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    
    ResponseUtil.success(res, {
      user: result.user,
      tokens: result.tokens,
    }, 'Login successful');
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    
    ResponseUtil.success(res, {
      user: result.user,
      tokens: result.tokens,
    }, 'Registration successful', 201);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    
    ResponseUtil.success(res, { tokens }, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    
    ResponseUtil.success(res, null, 'Logout successful');
  });

  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    
    ResponseUtil.success(res, null, 'Password reset email sent');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    
    ResponseUtil.success(res, null, 'Password reset successful');
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    await authService.verifyEmail(token);
    
    ResponseUtil.success(res, null, 'Email verified successfully');
  });

  getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    
    ResponseUtil.success(res, user, 'User retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    
    ResponseUtil.success(res, user, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    
    ResponseUtil.success(res, null, 'Password changed successfully');
  });
}

export const authController = new AuthController();
export default authController;