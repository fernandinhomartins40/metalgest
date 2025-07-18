import { trpc } from "../../lib/trpc";
import type { ProductFilters } from "@metalgest/shared";

export function useProducts(filters?: ProductFilters) {
  return trpc.products.list.useQuery(filters || {}, {
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return trpc.products.get.useQuery(
    { id },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCreateProduct() {
  const utils = trpc.useUtils();
  
  return trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
  });
}

export function useUpdateProduct() {
  const utils = trpc.useUtils();
  
  return trpc.products.update.useMutation({
    onSuccess: (data) => {
      utils.products.list.invalidate();
      utils.products.get.invalidate({ id: data.id });
    },
  });
}

export function useDeleteProduct() {
  const utils = trpc.useUtils();
  
  return trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
    },
  });
}

export function useSearchProducts(query: string, enabled = true) {
  return trpc.products.search.useQuery(
    { query, limit: 10 },
    {
      enabled: enabled && query.length > 0,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useProductCategories() {
  return trpc.products.getCategories.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLowStockProducts() {
  return trpc.products.getLowStock.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProductStock() {
  const utils = trpc.useUtils();
  
  return trpc.products.updateStock.useMutation({
    onSuccess: (data) => {
      utils.products.list.invalidate();
      utils.products.get.invalidate({ id: data.id });
      utils.products.getLowStock.invalidate();
    },
  });
}