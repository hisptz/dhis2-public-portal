import { getImageUrl } from "@/utils/images";
import { env } from "@/utils/env";

export function getServerImageUrl(id: string) {
	return getImageUrl(id, { baseUrl: `${env.CONTEXT_PATH ?? "/"}` });
}
