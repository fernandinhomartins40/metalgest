import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@metalgest/shared";

export const trpc = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser environment - use environment variable or detect domain
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      return apiUrl.replace('/api/v1', ''); // Remove v1 suffix for tRPC
    }
    
    // Auto-detect for production
    const hostname = window.location.hostname;
    if (hostname.includes('metalgest.com.br')) {
      return 'https://metalgest.com.br';
    }
    
    return ""; // Use relative URL for localhost development
  }
  
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:3001`; // dev SSR should use localhost
};

export const trpcConfig = {
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          // Add any authentication headers here
        };
      },
    }),
  ],
};