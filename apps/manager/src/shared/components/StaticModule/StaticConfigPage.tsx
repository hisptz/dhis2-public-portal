import React from "react";
import { StaticItemList } from "./components/StaticItemList";
import { GeneralConfig } from "./components/GeneralConfig";

export function StaticConfigPage() {
	return (
		<div className="flex flex-col gap-6">
			<GeneralConfig />
			<StaticItemList />
		</div>
	);
}
