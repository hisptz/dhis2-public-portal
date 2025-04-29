import React from "react";
import i18n from "@dhis2/d2-i18n";
import { HeaderStyleConfig } from "./components/HeaderStyleConfig";
import { StyleConfig } from "./components/StyleConfig";

export function AdvancedHeaderConfig() {
	return (
		<div className="flex flex-col gap-2">
			<HeaderStyleConfig />

			<hr className="border-gray-200 my-2" />

			{/*	title style*/}
			<StyleConfig
				label={i18n.t("Title styles")}
				parentName={"title.style"}
			/>
			<hr className="border-gray-200 my-2" />

			{/*	subtitle style*/}
			<StyleConfig
				label={i18n.t("Subtitle styles")}
				parentName={"subtitle.style"}
			/>
		</div>
	);
}
