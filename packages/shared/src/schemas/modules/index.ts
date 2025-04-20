import { sectionModuleConfigSchema } from "./section";
import { z } from "zod";
import { visualizationModuleSchema } from "./visualization";

export * from "./base";
export * from "./section";
export * from "./visualization";

export const moduleSchema = z.discriminatedUnion("type", [
	sectionModuleConfigSchema,
	visualizationModuleSchema,
]);

export type AppModule = z.infer<typeof moduleSchema>;
