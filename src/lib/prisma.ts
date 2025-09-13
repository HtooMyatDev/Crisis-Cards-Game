import { PrismaClient } from '@prisma/client';

// This file creates a single, reusable instance of the PrismaClient
// to prevent issues with database connections in a Next.js development environment.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
