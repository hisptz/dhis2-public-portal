import { sectionModuleConfigSchema } from "./section";
import { z } from "zod";
import { visualizationModuleSchema } from "./visualization";
import { staticModuleSchema } from "./static";

export * from "./base";
export * from "./section";
export * from "./visualization";
export * from "./static";

export const moduleSchema = z.discriminatedUnion("type", [
	sectionModuleConfigSchema,
	visualizationModuleSchema,
	staticModuleSchema,
]);

export type AppModule = z.infer<typeof moduleSchema>;
