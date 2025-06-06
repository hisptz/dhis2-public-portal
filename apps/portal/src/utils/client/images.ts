"use client";

import { useConfig } from "@dhis2/app-runtime";
import { getImageUrl } from "@/utils/images";

export function useGetImageUrl() {
	const dhis2Config = useConfig();
	const baseUrl = dhis2Config.baseUrl;
	const contextPath = new URL(baseUrl).pathname;

	return (documentId: string) =>
		getImageUrl(documentId, {
			baseUrl: `${contextPath}`,
		});
}
