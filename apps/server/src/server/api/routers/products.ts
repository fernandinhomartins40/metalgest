import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { productSchema, productFilterSchema } from "@metalgest/shared";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const productsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(productFilterSchema)
    .query(async ({ ctx, input }) => {
      const {
        search,
        category,
        active,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
        sortOrder,
      } = input;

      const where = {
        userId: ctx.session.user.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(category && { category }),
        ...(active !== undefined && { active }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      };

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          orderBy: {
            [sortBy || "createdAt"]: sortOrder,
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product;
    }),

  create: protectedProcedure
    .input(productSchema)
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          module: "products",
          details: {
            productId: product.id,
            name: product.name,
          },
        },
      });

      return product;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: productSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingProduct = await ctx.db.product.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const product = await ctx.db.product.update({
        where: { id: input.id },
        data: input.data,
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          module: "products",
          details: {
            productId: product.id,
            changes: input.data,
          },
        },
      });

      return product;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingProduct = await ctx.db.product.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Check if product is used in quotes
      const quotesCount = await ctx.db.quoteItem.count({
        where: { productId: input.id },
      });

      if (quotesCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete product that is used in quotes",
        });
      }

      await ctx.db.product.delete({
        where: { id: input.id },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          module: "products",
          details: {
            productId: input.id,
            name: existingProduct.name,
          },
        },
      });

      return { message: "Product deleted successfully" };
    }),

  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: {
          userId: ctx.session.user.id,
          active: true,
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
            { sku: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: input.limit,
        orderBy: { name: "asc" },
      });

      return products;
    }),

  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.product.findMany({
      where: {
        userId: ctx.session.user.id,
        active: true,
      },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return categories.map((c) => c.category);
  }),

  getLowStock: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: {
        userId: ctx.session.user.id,
        active: true,
        stock: {
          lte: ctx.db.product.fields.minStock,
        },
      },
      orderBy: { stock: "asc" },
    });

    return products;
  }),

  updateStock: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        stock: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingProduct = await ctx.db.product.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const product = await ctx.db.product.update({
        where: { id: input.id },
        data: { stock: input.stock },
      });

      // Create audit log
      await ctx.db.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update_stock",
          module: "products",
          details: {
            productId: product.id,
            oldStock: existingProduct.stock,
            newStock: input.stock,
          },
        },
      });

      return product;
    }),
});