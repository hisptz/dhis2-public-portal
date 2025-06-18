import { baseModuleSchema, ModuleType } from "./base";
import { z } from "zod";

export const staticItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	icon: z.string().optional(),
	shortDescription: z.string(),
	content: z.string(),
});

export type StaticItemConfig = z.infer<typeof staticItemSchema>;

export const staticModuleConfigSchema = z.object({
	namespace: z.string(),
	title: z.string(),
});

export type StaticModuleConfig = z.infer<typeof staticModuleConfigSchema>;

export const staticModuleSchema = baseModuleSchema.extend({
	type: z.literal(ModuleType.STATIC),
	config: staticModuleConfigSchema,
});

export type StaticModule = z.infer<typeof staticModuleSchema>;
