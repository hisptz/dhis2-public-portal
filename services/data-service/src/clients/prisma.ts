import { PrismaClient } from '@/generated/prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

config()

export const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

export const dbClient = new PrismaClient({ adapter })
