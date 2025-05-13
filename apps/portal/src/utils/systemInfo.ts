"use server";

import { dhis2HttpClient } from "@/utils/api/dhis2";
import { D2SystemInfo } from "@/types/d2SystemInfo";

export async function getSystemInfo() {
	try {
		const url = `system/info`;
		return dhis2HttpClient.get<D2SystemInfo>(url);
	} catch (e) {
		return undefined;
	}
}
