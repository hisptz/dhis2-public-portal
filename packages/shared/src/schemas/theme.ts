import { z } from "zod";
import i18n from "@dhis2/d2-i18n";

export const themeSchema = z.object({
	id: z.string(),
	label: z.string(),
	content: z.string(),
	summary: z.string().max(400, {
		message: i18n.t("Summary should be 400 characters or less"),
	}),
	icon: z.string(),
	sortOrder: z.number(),
});

export type ThemeData = z.infer<typeof themeSchema>;
