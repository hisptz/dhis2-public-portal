import { z } from "zod";

export const envSchema = z.object({
	DHIS2_BASE_URL: z.string().url(),
	DHIS2_PAT: z.string(),
	DATA_SERVICE_PORT: z.string(),
	SERVE_HTTP: z.literal("true").optional(),
	REQUIRE_API_KEY: z.enum(["true", "false"]).optional(),
	API_KEYS: z.string().optional(),
	FLEXIPORTAL_URL: z.string().url().optional(),
	// RabbitMQ configuration
	RABBITMQ_URI: z.string().optional(),
	RABBITMQ_HOST: z.string().optional(),
	RABBITMQ_USER: z.string().optional(),
	RABBITMQ_PASS: z.string().optional(),
	RABBITMQ_PREFETCH_COUNT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
