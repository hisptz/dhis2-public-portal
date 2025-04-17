import { getAppConfigWithNamespace } from "@/utils/config";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppMeta } from "@packages/shared/schemas";
import { Metadata } from "next";

export async function getAppMetadata(): Promise<Metadata> {
	const config = await getAppConfigWithNamespace<AppMeta>({
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "metadata",
	});

	if (!config) {
		return {
			title: "Public Portal",
			description: "DHIS2 Public Portal",
		};
	}

	return {
		applicationName: config?.name,
		title: config?.name,
		description: config?.description,
		icons: [...config.icons],
	} as Metadata;
}
