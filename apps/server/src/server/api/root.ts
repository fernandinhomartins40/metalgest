import { createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { dashboardRouter } from "./routers/dashboard";
import { productsRouter } from "./routers/products";
import { servicesRouter } from "./routers/services";
import { clientsRouter } from "./routers/clients";
// import { quotesRouter } from "./routers/quotes";
// import { transactionsRouter } from "./routers/transactions";
// import { settingsRouter } from "./routers/settings";
// import { usersRouter } from "./routers/users";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  dashboard: dashboardRouter,
  products: productsRouter,
  services: servicesRouter,
  clients: clientsRouter,
  // quotes: quotesRouter,
  // transactions: transactionsRouter,
  // settings: settingsRouter,
  // users: usersRouter,
});

export type AppRouter = typeof appRouter;