export function getImageUrl(
	documentId: string,
	{ baseUrl }: { baseUrl: string },
) {
	return `${baseUrl}/api/documents/${documentId}/data`;
}
