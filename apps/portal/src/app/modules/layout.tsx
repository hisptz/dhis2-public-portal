import { MainLayout } from "@/components/MainLayout";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";
import { getAppearanceConfig } from "@/utils/config/appConfig";
import React from "react";

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const config = await getAppearanceConfig();

	if (!config) {
		return <NoConfigLandingPage />;
	}

	const { appearanceConfig, menuConfig } = config;
	return (
		<MainLayout menuConfig={menuConfig} appearanceConfig={appearanceConfig}>
			{children}
		</MainLayout>
	);
}
