import { getAppConfigWithNamespace } from "@/utils/config";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { createTheme } from "@mantine/core";

export async function getAppTheme() {
	const appearanceConfig =
		await getAppConfigWithNamespace<AppAppearanceConfig>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "appearance",
		});

	return createTheme({
		primaryColor: appearanceConfig?.colors?.primary,
	});
}
