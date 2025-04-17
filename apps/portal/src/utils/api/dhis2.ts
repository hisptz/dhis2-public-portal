import { HttpClient } from "./http";
import { env } from "@/utils/env";

export const dhis2HttpClient = new HttpClient(
	`${env.DHIS2_BASE_URL}/api/`,
	env.DHIS2_BASE_PAT_TOKEN,
);
