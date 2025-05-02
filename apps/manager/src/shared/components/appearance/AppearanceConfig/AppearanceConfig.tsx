import React from "react";
import { AppAppearanceConfig } from "@packages/shared/schemas";
import { AppColorConfig } from "./components/AppColorConfig";
import { HeaderConfig } from "./components/HeaderConfig";
import { FooterConfig } from "./components/FooterConfig";

type Props = {
	appearanceConfig: AppAppearanceConfig;
	refetchConfig: () => void;
};

export function AppearanceConfig({ appearanceConfig, refetchConfig }: Props) {
	return (
		<div className="flex flex-col gap-6 pb-8">
			{/*Application colors configurations*/}
			<AppColorConfig
				config={appearanceConfig}
				refetchConfig={refetchConfig}
			/>

			{/*Header configurations*/}
			<HeaderConfig
				appearanceConfig={appearanceConfig}
				refetchConfig={refetchConfig}
			/>

			{/*Footer configurations*/}
			<FooterConfig
				config={appearanceConfig}
				refetchConfig={refetchConfig}
			/>
		</div>
	);
}
