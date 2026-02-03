import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma_habit_tracker: PrismaClient }

export const prisma = globalForPrisma.prisma_habit_tracker || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_habit_tracker = prisma
