import { z } from "zod";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const envSchema = z.object({
	DHIS2_BASE_URL: z.string(),
	DHIS2_BASE_PAT_TOKEN: z.string(),
});

console.log(process.env);
export const env = envSchema.safeParse(process.env).data ?? {
	DHIS2_BASE_URL: "",
	DHIS2_BASE_PAT_TOKEN: "",
};
