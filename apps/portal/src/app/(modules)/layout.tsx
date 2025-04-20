import { MainLayout } from "@/components/MainLayout";
import { getAppearanceConfig } from "@/utils/theme";
import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";

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
