import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { loginSchema, registerSchema } from "@metalgest/shared";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.js";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.active) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Account is inactive",
        });
      }

      // Update last login
      await ctx.db.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: user.id,
          action: "login",
          module: "auth",
          details: {
            email: user.email,
            loginTime: new Date(),
          },
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          active: user.active,
        },
        message: "Login successful",
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Create audit log
    await ctx.db.auditLog.create({
      data: {
        userId: ctx.session.user.id,
        action: "logout",
        module: "auth",
        details: {
          logoutTime: new Date(),
        },
      },
    });

    return { message: "Logout successful" };
  }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          active: true,
          createdAt: true,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: user.id,
          action: "register",
          module: "auth",
          details: {
            email: user.email,
            name: user.name,
          },
        },
      });

      return {
        user,
        message: "User created successfully",
      };
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        active: true,
        emailVerified: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email } = input;

      // Check if email is already taken by another user
      const existingUser = await ctx.db.user.findFirst({
        where: {
          email,
          NOT: { id: ctx.session.user.id },
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { name, email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          active: true,
          updatedAt: true,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update_profile",
          module: "auth",
          details: {
            changes: { name, email },
          },
        },
      });

      return user;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      // Get user with password
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);

      // Update password
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedNewPassword },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "change_password",
          module: "auth",
          details: {
            timestamp: new Date(),
          },
        },
      });

      return { message: "Password changed successfully" };
    }),

  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { password } = input;

      // Get user with password
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Password is incorrect",
        });
      }

      // Create audit log before deletion
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete_account",
          module: "auth",
          details: {
            email: user.email,
            name: user.name,
          },
        },
      });

      // Delete user (cascade will handle related data)
      await ctx.db.user.delete({
        where: { id: ctx.session.user.id },
      });

      return { message: "Account deleted successfully" };
    }),
});