import { PrismaClient } from '@prisma/client';

declare global {
  var __metalgestPrisma__: PrismaClient | undefined;
}

const logLevels = [
  { emit: 'event' as const, level: 'query' as const },
  { emit: 'event' as const, level: 'info' as const },
  { emit: 'event' as const, level: 'warn' as const },
  { emit: 'event' as const, level: 'error' as const },
];

export const prisma =
  globalThis.__metalgestPrisma__ ||
  new PrismaClient({
    log: logLevels,
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__metalgestPrisma__ = prisma;
}

export default prisma;
