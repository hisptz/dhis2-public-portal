import { visualizationDisplayItemSchema } from "./visualization";
import { z } from "zod";
import { richTextDisplayItemSchema } from "./richText";
import { highlightedSingleValueDisplayItemSchema } from "./singleValue";
import { feedbackDisplayItemSchema } from "./feedback";
import { visualizationSlideshowDisplayItemSchema } from "./visualizationSlideshow";

export * from "./base";
export * from "./richText";
export * from "./visualizationSlideshow";
export * from "./singleValue";
export * from "./feedback";
export * from "./visualization";

export const displayItemSchema = z.discriminatedUnion("type", [
	visualizationDisplayItemSchema,
	richTextDisplayItemSchema,
	highlightedSingleValueDisplayItemSchema,
	feedbackDisplayItemSchema,
	visualizationSlideshowDisplayItemSchema,
]);
export type DisplayItem = z.infer<typeof displayItemSchema>;
