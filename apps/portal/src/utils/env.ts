import { z } from "zod";

const envSchema = z.object({
	DHIS2_BASE_URL: z.string(),
	DHIS2_BASE_PAT_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);
