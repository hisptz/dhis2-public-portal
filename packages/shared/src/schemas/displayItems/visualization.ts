import { z } from "zod";
import { baseDisplayItemSchema, DisplayItemType } from "./base";

export const visualizationDisplayItemSchema = baseDisplayItemSchema.extend({
	type: z.literal(DisplayItemType.VISUALIZATION),
});
