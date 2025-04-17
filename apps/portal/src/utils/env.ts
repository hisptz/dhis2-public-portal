import { z } from "zod";

const envSchema = z.object({
	DHIS2_BASE_URL: z.string(),
	DHIS2_BASE_PAT_TOKEN: z.string(),
});

export const env = envSchema.safeParse(process.env).data ?? {
	DHIS2_BASE_URL: "",
	DHIS2_BASE_PAT_TOKEN: "",
};
