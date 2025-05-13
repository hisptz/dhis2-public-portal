import { getIconUrl, getImageUrl } from "@/utils/images";
import { env } from "@/utils/env";

export function getServerImageUrl(id: string) {
	return getImageUrl(id, { baseUrl: `${env.CONTEXT_PATH ?? ""}` });
}

export function getServerIconUrl(id: string) {
	return getIconUrl(id, { baseUrl: `${env.CONTEXT_PATH ?? ""}` });
}
