import { z } from "zod";

export const envSchema = z.object({
	DHIS2_BASE_URL: z.string().url(),
	DHIS2_PAT: z.string(),
	DATA_SERVICE_PORT: z.string(),
	SERVE_HTTP: z.literal("true").optional(),
});

export type Env = z.infer<typeof envSchema>;
