import { baseDisplayItemSchema, DisplayItemType } from "./base";
import { z } from "zod";

export const singeValueSchema = z.object({
	id: z.string(),
	icon: z.string(),
});

export type SingleValueConfig = z.infer<typeof singeValueSchema>;

export const singleValueDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.SINGLE_VALUE),
	item: singeValueSchema,
});

export type SingleValueDisplayItemConfig = z.infer<
	typeof singleValueDisplayItemSchema
>;
