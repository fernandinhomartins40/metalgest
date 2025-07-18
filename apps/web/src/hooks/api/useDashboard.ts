import { trpc } from "../../lib/trpc";

export function useDashboardStats() {
  return trpc.dashboard.getStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useDashboardCharts() {
  return trpc.dashboard.getCharts.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useRecentQuotes(limit = 5) {
  return trpc.dashboard.getRecentQuotes.useQuery(
    { limit },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );
}

export function useDashboardPerformance() {
  return trpc.dashboard.getPerformance.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}