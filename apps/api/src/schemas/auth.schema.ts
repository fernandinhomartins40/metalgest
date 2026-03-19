import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must have at least 8 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/\d/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a symbol');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('A valid email is required'),
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, 'A valid reset token is required'),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(20, 'A valid verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').optional(),
  phone: z.string().trim().max(30, 'Phone is too long').optional(),
  avatar: z.string().trim().max(500, 'Avatar is too long').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
