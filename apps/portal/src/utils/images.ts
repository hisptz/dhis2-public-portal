import { useConfig } from "@dhis2/app-runtime";

export function getImageUrl(
	documentId: string,
	{ baseUrl }: { baseUrl: string },
) {
	return `${baseUrl}/api/documents/${documentId}/data`;
}

export function useGetImageUrl() {
	const dhis2Config = useConfig();
	return (documentId: string) => getImageUrl(documentId, dhis2Config);
}
