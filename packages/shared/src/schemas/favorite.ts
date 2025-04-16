import { z } from "zod";
import { layoutSchema, visualizationSchema } from "./dashboard";

const favoriteConfigSchema = z.object({
	visualizations: z.array(visualizationSchema),
	layouts: layoutSchema,
});

export type FavoriteConfig = z.infer<typeof favoriteConfigSchema>;
