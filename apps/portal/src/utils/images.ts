export function getImageUrl(
	documentId: string,
	{ baseUrl }: { baseUrl: string },
) {
	return `${baseUrl}/api/documents/${documentId}/data`.replace("//", "/");
}

export function getIconUrl(iconId: string, { baseUrl }: { baseUrl: string }) {
	return `${baseUrl}/api/icons/${iconId}/icon`.replace("//", "/");
}
