export function getImageUrl(
	documentId: string,
	{ baseUrl }: { baseUrl: string },
) {
	return `${baseUrl}/api/documents/${documentId}/data`;
}

export function getIconUrl(iconId: string, { baseUrl }: { baseUrl: string }) {
	return `${baseUrl}/api/icons/${iconId}/icon`;
}
