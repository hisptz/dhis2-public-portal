import { visualizationDisplayItemSchema } from "./visualization";
import { z } from "zod";
import { richTextDisplayItemSchema } from "./richText";
import { singleValueDisplayItemSchema } from "./singleValue";

export * from "./base";
export * from "./richText";
export * from "./singleValue";
export * from "./visualization";

export const displayItemSchema = z.discriminatedUnion("type", [
	visualizationDisplayItemSchema,
	richTextDisplayItemSchema,
	singleValueDisplayItemSchema,
]);
export type DisplayItem = z.infer<typeof displayItemSchema>;
