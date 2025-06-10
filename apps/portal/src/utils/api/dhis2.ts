import { D2HttpClient } from "./http";
import { env } from "@/utils/env";

export const dhis2HttpClient = new D2HttpClient(
	env.DHIS2_BASE_URL,
	env.DHIS2_BASE_PAT_TOKEN,
);
