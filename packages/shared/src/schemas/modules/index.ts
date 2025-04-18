import { sectionModuleConfigSchema } from "./section";
import { z } from "zod";

export * from "./base";
export * from "./section";

export const moduleSchema = z.discriminatedUnion("type", [
	sectionModuleConfigSchema,
]);

export type AppModule = z.infer<typeof moduleSchema>;
