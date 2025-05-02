import {
	AppMenuConfig,
	MenuItemType,
	MenuPosition,
} from "@packages/shared/schemas";

export const defaultMenuConfig: AppMenuConfig = {
	position: MenuPosition.SIDEBAR,
	items: [
		{
			type: MenuItemType.MODULE,
			moduleId: "home",
			label: "Home",
			path: "home",
			sortOrder: 1,
		},
	],
};
