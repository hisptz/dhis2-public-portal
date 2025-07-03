import { AppAppearanceConfig } from "@packages/shared/schemas";

export const defaultAppearanceConfig: AppAppearanceConfig = {
	logo: "https://avatars.githubusercontent.com/u/1089987?s=200&v=4",
	colors: {
		primary: "#2C6693",
		background: "#F3F5F7",
		titlesColor: "#120d0c",
		chartColors: [
			"#2c6693",
			"#5a6aaa",
			"#9069b3",
			"#c563ac",
			"#f05f94",
			"#ff6970",
			"#ff8345",
			"#ffa600",
		],
	},
	footer: {
		copyright: `All rights reserved. @ ${new Date().getFullYear()}`,
		showTitle: true,
		coloredBackground: false,
		usePrimaryColorAsBackgroundColor: false,
		footerItems: [
			{
				title: "Address",
				type: "static",
				staticContent: "<p>An example address will be shown here</p>",
			},
			{
				title: "Useful Links",
				type: "links",
				links: [
					{
						url: "https://dhis2.org",
						name: "DHIS2 website",
					},
					{
						url: "https://docs.dhis2.org",
						name: "DHIS2 Documentations",
					},
					{
						url: "https://hisp.tz",
						name: "HISP Tanzania",
					},
				],
			},
		],
	},
	header: {
		style: {
			leadingLogo: {
				show: true,
				width: 60,
				height: 60,
			},
			trailingLogo: {
				show: false,
				width: 60,
				height: 60,
			},
			containerHeight: 138,
			coloredBackground: true,
			usePrimaryColorAsBackgroundColor: true,
		},
		title: {
			text: "DHIS2 FlexiPortal",
			style: {
				align: "left",
				textSize: 30,
				textColor: "#ffffff",
			},
		},
		subtitle: {
			text: "A customizable public portal for a DHIS2 implementation",
			style: {
				textSize: 14,
				textColor: "#ffffff",
			},
		},
	},
};
