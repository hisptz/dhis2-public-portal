import { z } from 'zod'

export const envSchema = z.object({
    DHIS2_BASE_URL: z.string().url(),
    DHIS2_PAT: z.string(),
    DATA_SERVICE_PORT: z.string(),
    // RabbitMQ configuration
    RABBITMQ_URI: z.string().optional(),
    RABBITMQ_HOST: z.string(),
    RABBITMQ_USER: z.string(),
    RABBITMQ_PASS: z.string(),
    RABBITMQ_PREFETCH_COUNT: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>
