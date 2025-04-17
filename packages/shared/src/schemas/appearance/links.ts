import { z } from "zod";

export const footerLinkSchema = z.object({
	name: z.string(),
	url: z.string().url(),
});

export type FooterLink = z.infer<typeof footerLinkSchema>;

export const footerLinksConfig = z.object({
	title: z.string(),
	links: z.array(footerLinkSchema),
});

export type FooterLinksConfig = z.infer<typeof footerLinksConfig>;
