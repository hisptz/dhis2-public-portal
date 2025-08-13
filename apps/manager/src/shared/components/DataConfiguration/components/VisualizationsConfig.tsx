import React from "react";
import { VisualizationSelector } from "./VisualizationSelector";
import i18n from "@dhis2/d2-i18n";

export function VisualizationsConfig() {
	return (
		<>
			<VisualizationSelector
				name={"visualizations"}
				label={i18n.t("Visualizations")}
			/>
		</>
	);
}
