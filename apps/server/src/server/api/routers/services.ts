import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const servicesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const services = await ctx.db.service.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return services;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = await ctx.db.service.findFirst({
        where: { 
          id: input.id,
          userId: ctx.session.user.id 
        },
      });

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      return service;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      category: z.string().min(1),
      duration: z.number().optional(),
      active: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.db.service.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create_service",
          module: "services",
          details: {
            serviceId: service.id,
            serviceName: service.name,
          },
        },
      });

      return service;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      category: z.string().min(1),
      duration: z.number().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const service = await ctx.db.service.findFirst({
        where: { id, userId: ctx.session.user.id },
      });

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      const updatedService = await ctx.db.service.update({
        where: { id },
        data,
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update_service",
          module: "services",
          details: {
            serviceId: service.id,
            changes: data,
          },
        },
      });

      return updatedService;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = await ctx.db.service.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Service not found",
        });
      }

      await ctx.db.service.delete({
        where: { id: input.id },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete_service",
          module: "services",
          details: {
            serviceId: service.id,
            serviceName: service.name,
          },
        },
      });

      return { message: "Service deleted successfully" };
    }),
});