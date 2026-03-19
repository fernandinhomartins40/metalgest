import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AuthTokenType, Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import { emailService } from '@/services/email.service';

const REFRESH_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  plan: string;
  subscriptionStatus: string;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
};

type RegisterResult = {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  rememberMe: boolean;
  verificationRequired: boolean;
  emailDispatched: boolean;
  message: string;
};

type LoginResult = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const assertPasswordPolicy = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol) {
    return;
  }

  throw new AppError(
    400,
    'Password must contain at least 8 characters, uppercase, lowercase, number and symbol',
    'INVALID_PASSWORD_FORMAT'
  );
};

export class AuthService {
  private isEmailVerificationRequired() {
    return process.env.AUTH_REQUIRE_EMAIL_VERIFICATION !== 'false';
  }

  private ensureEmailServiceConfigured(feature: 'verification' | 'password_reset') {
    if (emailService.isConfigured()) {
      return;
    }

    const message =
      feature === 'verification'
        ? 'Email service is not configured for account verification'
        : 'Email service is not configured for password recovery';

    throw new AppError(503, message, 'EMAIL_SERVICE_UNAVAILABLE');
  }

  private generateTokens(userId: string, email: string, role: UserRole, rememberMe = false): TokenPair {
    const jwtSecret = process.env.JWT_SECRET!;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
    const accessExpiresIn = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];
    const refreshExpiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

    const accessToken = jwt.sign(
      { sub: userId, email, role },
      jwtSecret as jwt.Secret,
      { expiresIn: accessExpiresIn }
    );

    const refreshToken = jwt.sign(
      { sub: userId, rememberMe },
      refreshSecret as jwt.Secret,
      { expiresIn: refreshExpiresIn }
    );

    return { accessToken, refreshToken, rememberMe };
  }

  private getRefreshTokenExpiryDate() {
    return new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS);
  }

  private createTokenHash(rawToken: string) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private createOpaqueToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  private async persistRefreshToken(userId: string, refreshToken: string) {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: this.getRefreshTokenExpiryDate(),
      },
    });
  }

  private async issueAuthToken(
    userId: string,
    type: AuthTokenType,
    lifetimeMs: number,
    metadata?: Record<string, unknown>
  ) {
    const rawToken = this.createOpaqueToken();
    const tokenHash = this.createTokenHash(rawToken);

    await prisma.authToken.deleteMany({
      where: {
        userId,
        type,
        consumedAt: null,
      },
    });

    await prisma.authToken.create({
      data: {
        userId,
        type,
        tokenHash,
        expiresAt: new Date(Date.now() + lifetimeMs),
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return rawToken;
  }

  private async consumeAuthToken(rawToken: string, type: AuthTokenType) {
    const tokenHash = this.createTokenHash(rawToken);

    const token = await prisma.authToken.findUnique({
      where: { tokenHash },
    });

    if (!token || token.type !== type || token.consumedAt || token.expiresAt < new Date()) {
      throw new AppError(400, 'Invalid or expired token', 'INVALID_TOKEN');
    }

    const consumedToken = await prisma.authToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });

    return consumedToken;
  }

  private async buildAuthUser(userId: string): Promise<AuthUser> {
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
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    return user;
  }

  private async sendVerificationEmail(userId: string, email: string, name: string) {
    if (!emailService.isConfigured()) {
      return false;
    }

    const token = await this.issueAuthToken(
      userId,
      AuthTokenType.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_TOKEN_LIFETIME_MS,
      { email }
    );

    await emailService.sendVerificationEmail({
      userId,
      toEmail: email,
      recipientName: name,
      token,
    });

    return true;
  }

  private async sendPasswordResetEmail(userId: string, email: string, name: string) {
    if (!emailService.isConfigured()) {
      return false;
    }

    const token = await this.issueAuthToken(
      userId,
      AuthTokenType.PASSWORD_RESET,
      PASSWORD_RESET_TOKEN_LIFETIME_MS,
      { email }
    );

    await emailService.sendPasswordResetEmail({
      userId,
      toEmail: email,
      recipientName: name,
      token,
    });

    return true;
  }

  async register(name: string, email: string, password: string, rememberMe = true): Promise<RegisterResult> {
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name.trim();
    const verificationRequested = this.isEmailVerificationRequired();
    const verificationRequired = verificationRequested && emailService.isConfigured();

    assertPasswordPolicy(password);

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new AppError(409, 'Email already registered', 'DUPLICATE_EMAIL');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: verificationRequired ? false : true,
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

    if (verificationRequired) {
      const emailDispatched = await this.sendVerificationEmail(user.id, user.email, user.name);

      return {
        user,
        rememberMe: false,
        verificationRequired: true,
        emailDispatched,
        message: emailDispatched
          ? 'Account created. Check your inbox to confirm your email.'
          : 'Account created, but the verification email could not be sent.',
      };
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role,
      rememberMe
    );

    await this.persistRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
      rememberMe,
      verificationRequired: false,
      emailDispatched: false,
      message: 'Account created successfully',
    };
  }

  async login(email: string, password: string, rememberMe = false): Promise<LoginResult> {
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (!user.active) {
      throw new AppError(401, 'Account is inactive', 'ACCOUNT_INACTIVE');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (this.isEmailVerificationRequired() && !user.emailVerified) {
      const emailDispatched = await this.sendVerificationEmail(user.id, user.email, user.name);

      throw new AppError(
        403,
        emailDispatched
          ? 'Email not verified. A new confirmation link has been sent.'
          : 'Email not verified.',
        'EMAIL_NOT_VERIFIED',
        {
          email: user.email,
          emailDispatched,
          canResend: true,
        }
      );
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.email,
      user.role,
      rememberMe
    );

    await this.persistRefreshToken(user.id, refreshToken);

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
      rememberMe,
    };
  }

  async verifyEmail(token: string) {
    const authToken = await this.consumeAuthToken(token, AuthTokenType.EMAIL_VERIFICATION);

    await prisma.user.update({
      where: { id: authToken.userId },
      data: { emailVerified: true },
    });

    await prisma.authToken.deleteMany({
      where: {
        userId: authToken.userId,
        type: AuthTokenType.EMAIL_VERIFICATION,
      },
    });

    const user = await this.buildAuthUser(authToken.userId);

    return {
      user,
      message: 'Email verified successfully',
    };
  }

  async resendVerification(email: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!this.isEmailVerificationRequired()) {
      return {
        alreadyVerified: true,
        message: 'Email verification is not required in this environment.',
      };
    }

    this.ensureEmailServiceConfigured('verification');

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.active) {
      return {
        alreadyVerified: false,
        message: 'If the email exists, a new confirmation link has been sent.',
      };
    }

    if (user.emailVerified) {
      return {
        alreadyVerified: true,
        message: 'This email is already verified.',
      };
    }

    await this.sendVerificationEmail(user.id, user.email, user.name);

    return {
      alreadyVerified: false,
      message: 'Verification email sent successfully.',
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = normalizeEmail(email);

    this.ensureEmailServiceConfigured('password_reset');

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.active) {
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    await this.sendPasswordResetEmail(user.id, user.email, user.name);

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    assertPasswordPolicy(password);

    const authToken = await this.consumeAuthToken(token, AuthTokenType.PASSWORD_RESET);
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: authToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId: authToken.userId },
    });

    await prisma.authToken.deleteMany({
      where: {
        userId: authToken.userId,
        type: AuthTokenType.PASSWORD_RESET,
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }

  async refresh(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      throw new AppError(401, 'Refresh token is required', 'INVALID_TOKEN');
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_TOKEN');
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

    let decodedToken: { sub: string; rememberMe?: boolean };
    try {
      decodedToken = jwt.verify(refreshTokenValue, refreshSecret) as { sub: string; rememberMe?: boolean };
    } catch {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_TOKEN');
    }

    const rememberMe = Boolean(decodedToken.rememberMe);

    const { accessToken, refreshToken } = this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
      rememberMe
    );

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await this.persistRefreshToken(storedToken.user.id, refreshToken);

    return { accessToken, refreshToken, rememberMe };
  }

  async logout(refreshTokenValue: string) {
    if (!refreshTokenValue) {
      return;
    }

    await prisma.refreshToken.deleteMany({
      where: { token: refreshTokenValue },
    });
  }

  async getCurrentUser(userId: string) {
    return this.buildAuthUser(userId);
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    const updatePayload = {
      name: data.name?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      avatar: data.avatar?.trim() || undefined,
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
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

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect', 'INVALID_PASSWORD');
    }

    assertPasswordPolicy(newPassword);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export const authService = new AuthService();
