import { z } from "zod";
import { DisplayItemType } from "./base";
import { VisualizationDisplayItemType } from "./visualization";

export const slideshowVisualizationSchema = z.object({
	id: z.string(),
	type: z.nativeEnum(VisualizationDisplayItemType),
});

export type SlideshowVisualization = z.infer<
	typeof slideshowVisualizationSchema
>;

export const visualizationSlideshowItemConfig = z.object({
	visualizations: z.array(slideshowVisualizationSchema),
});

export type VisualizationSlideshowItemConfig = z.infer<
	typeof visualizationSlideshowItemConfig
>;

export const visualizationSlideshowDisplayItemSchema = z.object({
	type: z.literal(DisplayItemType.VISUALIZATIONS_SLIDESHOW),
	item: visualizationSlideshowItemConfig,
});

export type VisualizationSlideshowDisplayItem = z.infer<
	typeof visualizationSlideshowDisplayItemSchema
>;
