import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const clientsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const clients = await ctx.db.client.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return clients;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findFirst({
        where: { 
          id: input.id,
          userId: ctx.session.user.id 
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      return client;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      document: z.string().min(1),
      personType: z.enum(["FISICA", "JURIDICA"]).optional(),
      tradingName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      zipCode: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      contactName: z.string().optional(),
      contactRole: z.string().optional(),
      category: z.enum(["POTENTIAL", "REGULAR", "VIP"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.db.client.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create_client",
          module: "clients",
          details: {
            clientId: client.id,
            clientName: client.name,
          },
        },
      });

      return client;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      document: z.string().min(1),
      personType: z.enum(["FISICA", "JURIDICA"]).optional(),
      tradingName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      zipCode: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      contactName: z.string().optional(),
      contactRole: z.string().optional(),
      category: z.enum(["POTENTIAL", "REGULAR", "VIP"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const client = await ctx.db.client.findFirst({
        where: { id, userId: ctx.session.user.id },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      const updatedClient = await ctx.db.client.update({
        where: { id },
        data,
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update_client",
          module: "clients",
          details: {
            clientId: client.id,
            changes: data,
          },
        },
      });

      return updatedClient;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.db.client.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      await ctx.db.client.delete({
        where: { id: input.id },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete_client",
          module: "clients",
          details: {
            clientId: client.id,
            clientName: client.name,
          },
        },
      });

      return { message: "Client deleted successfully" };
    }),
});