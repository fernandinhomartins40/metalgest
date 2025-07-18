// Migration layer - provides backward compatibility with existing API calls
import { trpc } from "../../lib/trpc";
import { useToast } from "../use-toast";

// Legacy API interface for backward compatibility
export const api = {
  // Dashboard APIs
  dashboard: {
    getStats: () => {
      const { data, isLoading, error } = trpc.dashboard.getStats.useQuery();
      return { data, isLoading, error };
    },
    
    getCharts: () => {
      const { data, isLoading, error } = trpc.dashboard.getCharts.useQuery();
      return { data, isLoading, error };
    },
    
    getRecentQuotes: (limit = 5) => {
      const { data, isLoading, error } = trpc.dashboard.getRecentQuotes.useQuery({ limit });
      return { data, isLoading, error };
    },
    
    getPerformance: () => {
      const { data, isLoading, error } = trpc.dashboard.getPerformance.useQuery();
      return { data, isLoading, error };
    },
  },

  // Products APIs
  products: {
    list: (params = {}) => {
      const { data, isLoading, error } = trpc.products.list.useQuery(params);
      return { data, isLoading, error };
    },
    
    get: (id: string) => {
      const { data, isLoading, error } = trpc.products.get.useQuery({ id });
      return { data, isLoading, error };
    },
    
    create: () => {
      const { toast } = useToast();
      const utils = trpc.useUtils();
      
      return trpc.products.create.useMutation({
        onSuccess: () => {
          toast({
            title: "Produto criado",
            description: "O produto foi criado com sucesso.",
          });
          utils.products.list.invalidate();
        },
        onError: (error) => {
          toast({
            title: "Erro ao criar produto",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    },
    
    update: () => {
      const { toast } = useToast();
      const utils = trpc.useUtils();
      
      return trpc.products.update.useMutation({
        onSuccess: (data) => {
          toast({
            title: "Produto atualizado",
            description: "O produto foi atualizado com sucesso.",
          });
          utils.products.list.invalidate();
          utils.products.get.invalidate({ id: data.id });
        },
        onError: (error) => {
          toast({
            title: "Erro ao atualizar produto",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    },
    
    delete: () => {
      const { toast } = useToast();
      const utils = trpc.useUtils();
      
      return trpc.products.delete.useMutation({
        onSuccess: () => {
          toast({
            title: "Produto excluído",
            description: "O produto foi excluído com sucesso.",
          });
          utils.products.list.invalidate();
        },
        onError: (error) => {
          toast({
            title: "Erro ao excluir produto",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    },
    
    search: (params = {}) => {
      const { data, isLoading, error } = trpc.products.search.useQuery(params);
      return { data, isLoading, error };
    },
  },
};

// Re-export new hooks for modern usage
export * from "./useAuth";
export * from "./useDashboard";
export * from "./useProducts";
// export * from "./useServices";
// export * from "./useClients";
// export * from "./useQuotes";
// export * from "./useTransactions";
// export * from "./useSettings";
// export * from "./useUsers";