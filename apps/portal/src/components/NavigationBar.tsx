"use client";

import NextTopLoader from "nextjs-toploader";
import { AppAppearanceConfig } from "@packages/shared/schemas";

export function NavigationBar({
	config,
}: {
	config?: { appearanceConfig: AppAppearanceConfig };
}) {
	const color = config?.appearanceConfig.header.style.coloredBackground
		? (config.appearanceConfig.header.title.style?.textColor ?? "#FFFFFF")
		: config?.appearanceConfig.colors.primary;
	return <NextTopLoader color={color} />;
}
