import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					"50": "#f1f8fa",
					"100": "#dcedf1",
					"200": "#bedbe3",
					"300": "#91c1cf",
					"400": "#579bb1",
					"500": "#418299",
					"600": "#396b81",
					"700": "#33596b",
					"800": "#314c59",
					"900": "#2c404d",
					"950": "#192933",
				},
				background: {
					"50": "#f3f5f7",
					"100": "#eceff2",
					"200": "#d5dde2",
					"300": "#b0bfc9",
					"400": "#859bab",
					"500": "#668091",
					"600": "#516778",
					"700": "#425462",
					"800": "#394753",
					"900": "#333e47",
					"950": "#22292f",
				},
			},
		},
	},
	plugins: [],
};
export default config;
