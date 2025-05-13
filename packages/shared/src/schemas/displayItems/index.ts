import { visualizationDisplayItemSchema } from "./visualization";
import { z } from "zod";
import { richTextDisplayItemSchema } from "./richText";
import { singleValueDisplayItemSchema } from "./singleValue";
import { feedbackDisplayItemSchema } from "./feedback";

export * from "./base";
export * from "./richText";
export * from "./singleValue";
export * from "./feedback";
export * from "./visualization";

export const displayItemSchema = z.discriminatedUnion("type", [
	visualizationDisplayItemSchema,
	richTextDisplayItemSchema,
	singleValueDisplayItemSchema,
	feedbackDisplayItemSchema
]);
export type DisplayItem = z.infer<typeof displayItemSchema>;
