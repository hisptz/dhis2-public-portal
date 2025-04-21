import { sectionModuleConfigSchema } from "./section";
import { z } from "zod";
import { visualizationModuleSchema } from "./visualization";
import { staticModuleSchema } from "./static";
import { documentsModuleSchema } from "./documents";

export * from "./base";
export * from "./section";
export * from "./visualization";
export * from "./static";
export * from "./documents";

export const moduleSchema = z.discriminatedUnion("type", [
	sectionModuleConfigSchema,
	visualizationModuleSchema,
	staticModuleSchema,
	documentsModuleSchema,
]);

export type AppModule = z.infer<typeof moduleSchema>;
