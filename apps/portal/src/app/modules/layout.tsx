import { MainLayout } from "@/components/MainLayout";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";
import { getAppearanceConfig } from "@/utils/config/appConfig";
import React from "react";
import { getAppConfigWithNamespace } from "@/utils/config";
import { AppMeta } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const config = await getAppearanceConfig();
	const appMeta = await getAppConfigWithNamespace<AppMeta>({
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "metadata",
	});

	if (!config) {
		return <NoConfigLandingPage />;
	}

	const { appearanceConfig, menuConfig } = config;
	return (
		<MainLayout
			metadata={appMeta!}
			menuConfig={menuConfig}
			appearanceConfig={appearanceConfig}
		>
			{children}
		</MainLayout>
	);
}
