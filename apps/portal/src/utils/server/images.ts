import { getIconUrl, getImageUrl } from "@/utils/images";
import { env } from "@/utils/env";

export function getServerImageUrl(id: string) {
	try {
		return getImageUrl(id, { baseUrl: `${env.CONTEXT_PATH ?? ""}` });
	} catch (e) {
		return undefined;
	}
}

export function getServerIconUrl(id: string) {
	return getIconUrl(id, { baseUrl: `${env.CONTEXT_PATH ?? ""}` });
}
