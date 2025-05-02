import { AppAppearanceConfig } from "@packages/shared/schemas";

export const defaultAppearanceConfig: AppAppearanceConfig = {
	logo: "https://avatars.githubusercontent.com/u/1089987?s=200&v=4",
	title: {
		main: "DHIS2 Public Portal",
		subtitle: "A customizable public portal for your DHIS2",
	},
	colors: {
		primary: "#2C6693",
		background: "#F3F5F7",
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
						name: "DHIS2",
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
		logo: {
			enabled: true,
		},
		style: {
			leadingLogo: {
				url: "https://avatars.githubusercontent.com/u/1089987?s=200&v=4",
				width: 60,
				height: 60,
			},
			trailingLogo: {
				url: "https://avatars.githubusercontent.com/u/1089987?s=200&v=4",
				width: 60,
				height: 60,
			},
			containerHeight: 138,
			coloredBackground: true,
			headerBackgroundColor: "blue",
		},
		title: {
			style: {
				align: "left",
				textSize: 30,
				textColor: "#ffffff",
			},
		},
		subtitle: {
			style: {
				textSize: 14,
				textColor: "#ffffff",
			},
		},
	},
};
