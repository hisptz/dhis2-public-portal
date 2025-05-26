import i18n from "@dhis2/d2-i18n";

interface AppMenuItem {
	label: string;
	icon?: string;
	href?: string;
	description: string;
	action: string;
}

export const appMenus: Array<AppMenuItem> = [
	{
		label: i18n.t("General"),
		href: "/general",
		description: i18n.t("Setup application name and related information"),
		action: i18n.t("General configuration"),
	},
	{
		label: i18n.t("Appearance"),
		href: "/appearance",
		description: i18n.t(
			"Configure the logo, different icons, colors, and layouts of the web portal application",
		),
		action: i18n.t("Configure appearance"),
	},
	{
		label: i18n.t("Configuration"),
		href: "/configuration",
		description: i18n.t(
			"Export and import configurations from the datastore of the web portal application",
		),
		action: i18n.t("Configure Configuration"),
	},
	{
		label: i18n.t("Modules"),
		href: "/modules",
		description: i18n.t(
			"Configure different modules of the web portal application",
		),
		action: i18n.t("Configure modules"),
	},
	{
		label: i18n.t("App Menu"),
		href: "/menu",
		description: i18n.t(
			"Configure the position and contents of the app menu of the web portal application",
		),
		action: i18n.t("Configure app menu"),
	},
];
