import { AppAppearanceConfig } from "@packages/shared/schemas";
import { createTheme } from "@mantine/core";
import { generateColors } from "@mantine/colors-generator";

export function getAppTheme(appearanceConfig: AppAppearanceConfig) {
	const defaultPrimaryColor = "#2c6693";
	const primaryColorShades = generateColors(
		appearanceConfig?.colors?.primary ?? defaultPrimaryColor,
	);

	return createTheme({
		colors: {
			custom: primaryColorShades,
		},
		primaryColor: "custom",
	});
	//
	// return createTheme({
	// 	primaryColor: appearanceConfig?.colors?.primary,
	// });
}
