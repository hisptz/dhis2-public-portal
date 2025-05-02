import { dhis2HttpClient } from "@/utils/api/dhis2";
import { Pagination } from "@hisptz/dhis2-utils";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppAppearanceConfig, AppMenuConfig } from "@packages/shared/schemas";

const appConfigKeys = [
	"dashboards",
	"usefulLinks",
	"faq",
	"favorites",
	"news",
	"themes",
	"welcomeNote",
	"library",
	"surveyData",
	"feedback-emails",
] as const;

export type AppConfigKey = (typeof appConfigKeys)[number];

export async function getAppConfig<T>(key: AppConfigKey): Promise<T> {
	const url = `dataStore/${DatastoreNamespaces.MAIN_CONFIG}/${key}`;
	return (await dhis2HttpClient.get(url)) as T;
}

export async function getAppConfigWithNamespace<T>({
	namespace,
	key,
}: {
	namespace: string;
	key: string;
}) {
	const url = `dataStore/${namespace}/${key}`;
	return (await dhis2HttpClient.get(url)) as T | undefined;
}

export async function getAppConfigsFromNamespace<T>(
	namespace: string,
): Promise<T[]> {
	const url = `dataStore/${namespace}`;
	const response = await dhis2HttpClient.get<{
		entries: { key: string; value: T }[];
		pager: Pagination;
	}>(url, {
		params: {
			fields: ".",
		},
	});
	return response?.entries.map(({ value }) => value) ?? [];
}

export async function getAppearanceConfig() {
	const appearanceConfig =
		await getAppConfigWithNamespace<AppAppearanceConfig>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "appearance",
		});

	const menuConfig = await getAppConfigWithNamespace<AppMenuConfig>({
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "menu",
	});

	if (!appearanceConfig || !menuConfig) {
		return;
	}
	return {
		appearanceConfig,
		menuConfig,
	};
}
