import { AppAppearanceConfig } from "@packages/shared/schemas";

export const defaultAppearanceConfig: AppAppearanceConfig = {
	logo: "https://avatars.githubusercontent.com/u/1089987?s=200&v=4",
	title: {
		main: "DHIS2 Public Portal",
		subtitle: "A customizable public portal for a DHIS2 implementation",
	},
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
		address: {
			content: "<p>This is the test address</p>",
		},
		copyright: `All rights reserved. @ ${new Date().getFullYear()}`,
		footerLinks: {
			links: [
				{
					url: "https://dhis2.org",
					name: "DHIS2",
				},
			],
			title: "Useful Links",
		},
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
				center: false,
				textSize: 30,
				textColor: "white",
			},
		},
		subtitle: {
			style: {
				center: false,
				textSize: 14,
				textColor: "white",
			},
		},
	},
};
