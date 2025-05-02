import { AppAppearanceConfig } from "@packages/shared/schemas";

export const defaultAppearanceConfig: AppAppearanceConfig = {
	logo: "https://avatars.githubusercontent.com/u/1089987?s=200&v=4",
	colors: {
		primary: "#2C6693",
		background: "#F3F5F7",
		chartColors: [
			"#339af0",
			"#8992f6",
			"#c984ea",
			"#fa75cd",
			"#ff6ca5",
			"#ff7376",
			"#ff8a46",
			"#ffcd75",
		],
	},
	footer: {
		copyright: `All rights reserved. @ ${new Date().getFullYear()}`,
		showTitle: true,
		footerItems: [
			{
				title: "Address",
				type: "static",
				staticContent: "<p>This is the test address</p>",
			},
			{
				title: "Useful Links",
				type: "links",
				links: [
					{
						url: "https://dhis2.org",
						name: "DHIS2",
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
			text: "DHIS2 Public Portal",
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
