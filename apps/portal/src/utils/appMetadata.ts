import { getAppConfigWithNamespace } from "@/utils/config";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppMeta } from "@packages/shared/schemas";
import { Metadata } from "next";

export async function getAppMetadata(): Promise<Metadata> {
	try {
		let config = await getAppConfigWithNamespace<AppMeta>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "metadata",
		});
		if (!config) {
			return {
				title: "Public Portal",
				description: "DHIS2 FlexiPortal",
			};
		}

		return {
			applicationName: config?.name,
			title: {
				default: config?.name,
				template: `%s | ${config?.name}`,
			},
			description: config?.description,
		} as Metadata;
	} catch (e) {
		return {
			title: "Public Portal",
			description: "DHIS2 FlexiPortal",
		};
	}
}

export async function getAppMeta(): Promise<AppMeta | undefined> {
	try {
		return (await getAppConfigWithNamespace<AppMeta>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "metadata",
		}))!;
	} catch (e) {
		return;
	}
}
