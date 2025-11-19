import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';

export class AuthService {
  // Generate JWT tokens
  private generateTokens(userId: string, email: string, role: string) {
    const jwtSecret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

    const accessToken = jwt.sign(
      { sub: userId, email, role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { sub: userId },
      refreshSecret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, 'Email already registered', 'DUPLICATE_EMAIL');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        emailVerified: true,
        plan: true,
        subscriptionStatus: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken };
  }

  // Login
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check if user is active
    if (!user.active) {
      throw new AppError(401, 'Account is inactive', 'ACCOUNT_INACTIVE');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        emailVerified: user.emailVerified,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh token
  async refresh(refreshTokenValue: string) {
    // Find refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_TOKEN');
    }

    // Verify token
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
    try {
      jwt.verify(refreshTokenValue, refreshSecret);
    } catch {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_TOKEN');
    }

    // Generate new tokens
    const { accessToken, refreshToken } = this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role
    );

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: storedToken.user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  // Logout
  async logout(refreshTokenValue: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenValue },
    });
  }

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        emailVerified: true,
        plan: true,
        subscriptionStatus: true,
        phone: true,
        avatar: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    return user;
  }

  // Update profile
  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
      },
    });

    return user;
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect', 'INVALID_PASSWORD');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}

export const authService = new AuthService();
