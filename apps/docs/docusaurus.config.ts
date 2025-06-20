import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const appName = "DHIS2 FlexiPortal";
const repoURL = "https://github.com/hisptz/dhis2-public-portal";

const config: Config = {
	title: appName,
	tagline: "DHIS2 powered public web portal",
	favicon: "img/favicon.ico",
	url: "https://hisptz.github.io",
	baseUrl: "/dhis2-public-portal",
	trailingSlash: false,
	organizationName: "hisptz", // Usually your GitHub org/user name.
	projectName: "dhis2-public-portal", // Usually your repo name.
	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},
	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl: `${repoURL}/tree/main/apps/docs`,
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],
	themeConfig: {
		// Replace with your project's social card
		image: "img/dhis2-app-icon.png",
		navbar: {
			title: appName,
			logo: {
				alt: "logo",
				src: "img/dhis2-app-icon.png",
			},
			items: [
				{
					type: "docSidebar",
					sidebarId: "deploySidebar",
					position: "left",
					label: "Deployment",
				},
				{
					type: "docSidebar",
					sidebarId: "configSidebar",
					position: "left",
					label: "Configuration",
				},
				{
					type: "docSidebar",
					sidebarId: "developmentSidebar",
					position: "left",
					label: "Development guide",
				},
				// {
				// 	type: "docSidebar",
				// 	sidebarId: "guidelinesSidebar",
				// 	position: "left",
				// 	label: "Guidelines",
				// },
				{
					href: repoURL,
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "light",
			links: [
				{
					title: "Docs",
					items: [
						{
							label: "Deployment",
							to: "/docs/deployment/intro",
						},
						{
							label: "Configuration",
							to: "/docs/configuration/intro",
						},
						{
							label: "Development guide",
							to: "/docs/development/intro",
						},
						// {
						// 	label: "Guidelines",
						// 	to: "/docs/guidelines/intro",
						// },
					],
				},
				{
					title: "Community",
					items: [
						{
							label : "DHIS2 Community of Practice",
							href: "https://community.dhis2.org/t/dhis2-flexiportal-apps/66048",

						}
					],
				},
				{
					title: "More",
					items: [
						{
							label: "GitHub",
							href: "https://github.com/hisptz/dhis2-public-portal",
						},
						{
							label: "HISP Tanzania",
							href: "https://hisp.tz",
						},
						{
							label: "DHIS2",
							href: "https://dhis2.org",
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} HISP Tanzania, Inc. Built with Docusaurus.`,
		},
		prism: {
			additionalLanguages: ["json", "yaml", "bash", "nginx"],
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
