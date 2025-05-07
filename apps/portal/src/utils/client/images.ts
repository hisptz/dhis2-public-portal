"use client";

import { useConfig } from "@dhis2/app-runtime";
import { getImageUrl } from "@/utils/images";

export function useGetImageUrl() {
	const dhis2Config = useConfig();
	return (documentId: string) => getImageUrl(documentId, dhis2Config);
}
