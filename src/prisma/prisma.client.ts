import { PrismaClient } from '@prisma/client'

// Create a singleton instance of the PrismaClient
const prismaClientSingleton = () => {
	return new PrismaClient({
		log:
			process.env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
	})
}

// Use type 'any' here to avoid TypeScript error related to global augmentation
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

// Create global variable for prisma
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClientSingleton | undefined
}

// Initialize prisma client - use existing instance if available (useful for hot reloading)
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Set the global instance if we're not in production
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma
}

export default prisma
