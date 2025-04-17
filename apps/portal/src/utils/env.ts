import { z } from "zod";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const envSchema = z.object({
	DHIS2_BASE_URL: z.string(),
	DHIS2_BASE_PAT_TOKEN: z.string(),
});

export const env = envSchema.safeParse(process.env).data ?? {
	DHIS2_BASE_URL: "http://localhost:8080",
	DHIS2_BASE_PAT_TOKEN: "d2_pat-placeholder",
};
