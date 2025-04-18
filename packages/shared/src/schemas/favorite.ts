import { z } from "zod";
import { visualizationSchema } from "./dashboard";
import { layoutSchema } from "./layout";

const favoriteConfigSchema = z.object({
	visualizations: z.array(visualizationSchema),
	layouts: layoutSchema,
});

export type FavoriteConfig = z.infer<typeof favoriteConfigSchema>;
