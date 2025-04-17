import { getAppConfigWithNamespace } from "@/utils/config";
import { AppAppearanceConfig, AppMenuConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { createTheme } from "@mantine/core";

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
		theme: getAppTheme(appearanceConfig!),
		menuConfi,
	};
}

export function getAppTheme(appearanceConfig: AppAppearanceConfig) {
	return createTheme({
		primaryColor: appearanceConfig?.colors?.primary,
	});
}
