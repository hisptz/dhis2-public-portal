import { z } from "zod";
import { footerLinkSchema } from "./links";
import { logoConfig } from "./logo";
import { styleConfig } from "./style";

export const appMeta = z.object({
	name: z.string(),
	description: z.string(),
	icon: z.string(),
	icons: z.array(
		z.object({
			url: z.string().url(),
			type: z.string(),
			rel: z.string(),
		}),
	),
});

export const appColorConfig = z.object({
	primary: z.string(),
	background: z.string(),
	chartColors: z
		.array(z.string())
		.min(8, { message: "Must have at least 8 colors" }),
});

export const headerStyleConfig = z.object({
	coloredBackground: z.boolean(),
	headerBackgroundColor: z.string().optional(),
	containerHeight: z.number().optional(),
	trailingLogo: logoConfig.optional(),
	leadingLogo: logoConfig.optional(),
});

export const headerConfig = z.object({
	logo: z.object({
		enabled: z.boolean().optional(),
	}),
	subtitle: z.object({
		text: z
			.string()
			.max(100, { message: "Subtitle must be less than 100 characters" })
			.optional(),
		style: styleConfig.optional(),
	}),
	title: z.object({
		text: z
			.string()
			.min(1, { message: "Title is required" })
			.max(50, { message: "Title must be less than 50 characters" }),
		style: styleConfig.optional(),
	}),
	style: headerStyleConfig.optional(),
});

export const footerItemConfig = z.object({
	title: z.string(),
	type: z.enum(["links", "static"]),
	links: z.array(footerLinkSchema).optional(),
	staticContent: z.string().optional(),
});

export const footerConfig = z.object({
	copyright: z.string().optional(),
	showTitle: z.boolean().optional(),
	footerItems: z.array(footerItemConfig),
});

export const appAppearanceConfig = z.object({
	logo: z.string().url(),
	colors: appColorConfig,
	header: headerConfig,
	footer: footerConfig,
});

export type AppAppearanceConfig = z.infer<typeof appAppearanceConfig>;

export type AppMeta = z.infer<typeof appMeta>;

export type HeaderConfig = z.infer<typeof headerConfig>;

export type AppColorConfig = z.infer<typeof appColorConfig>;

export type FooterConfig = z.infer<typeof footerConfig>;

export type FooterItemConfig = z.infer<typeof footerItemConfig>;

export type HeaderStyleConfig = z.infer<typeof headerStyleConfig>;
