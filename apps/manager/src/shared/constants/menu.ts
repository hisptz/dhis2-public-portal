import i18n from "@dhis2/d2-i18n";

interface AppMenuItem {
	label: string;
	icon?: string;
	href?: string;
}

export const appMenus: Array<AppMenuItem> = [
	{
		label: i18n.t("Appearance"),
		href: "/appearance",
	},
	{
		label: i18n.t("App Menu"),
		href: "/app-menu",
	},
	{
		label: i18n.t("Modules"),
		href: "/modules",
	},
];
