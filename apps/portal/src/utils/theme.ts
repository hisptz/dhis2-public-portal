import { getAppConfigWithNamespace } from "@/utils/config";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { createTheme } from "@mantine/core";

export async function getAppearanceConfig() {
	const appearanceConfig =
		await getAppConfigWithNamespace<AppAppearanceConfig>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "appearance",
		});

	if (!appearanceConfig) {
		return;
	}
	return {
		appearanceConfig,
		theme: getAppTheme(appearanceConfig!),
	};
}

export function getAppTheme(appearanceConfig: AppAppearanceConfig) {
	return createTheme({
		primaryColor: appearanceConfig?.colors?.primary,
	});
}
