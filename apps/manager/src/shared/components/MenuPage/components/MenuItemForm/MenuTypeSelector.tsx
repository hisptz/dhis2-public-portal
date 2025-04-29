import { useWatch } from "react-hook-form";
import { MenuItem, MenuItemType } from "@packages/shared/schemas";
import { ModuleSelector } from "./ModuleSelector";
import React from "react";
import { ModulesSelector } from "./ModulesSelector";

export function MenuTypeSelector() {
	const type = useWatch<MenuItem, "type">({
		name: "type",
	});

	if (!type) {
		return null;
	}

	switch (type) {
		case MenuItemType.GROUP:
			return <ModulesSelector />;
		case MenuItemType.MODULE:
			return <ModuleSelector />;
	}
}
