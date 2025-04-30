import React from "react";
import { SectionModuleGeneralConfig } from "./components/SectionModuleGeneralConfig";
import { SectionsConfig } from "./components/SectionsConfig/SectionsConfig";

export function SectionConfigPage() {
	return (
		<div className="flex flex-col gap-6">
			<SectionModuleGeneralConfig />
			<SectionsConfig />
		</div>
	);
}
