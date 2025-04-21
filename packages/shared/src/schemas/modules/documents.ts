import { baseModuleSchema, ModuleType } from "./base";
import { z } from "zod";

export enum DocumentType {
	PDF = "PDF",
}

export const documentItemSchema = z.object({
	id: z.string(),
	label: z.string(),
	type: z.nativeEnum(DocumentType),
});

export type DocumentItem = z.infer<typeof documentItemSchema>;

export const baseDocumentModuleConfigSchema = z.object({
	title: z.string(),
	id: z.string(),
	grouped: z.boolean(),
});

export const documentGroupSchema = z.object({
	id: z.string(),
	title: z.string(),
	items: z.array(documentItemSchema),
});

export type DocumentGroup = z.infer<typeof documentGroupSchema>;

export const groupedDocumentModuleConfigSchema =
	baseDocumentModuleConfigSchema.extend({
		grouped: z.literal(true),
		groups: z.array(documentGroupSchema),
	});

export type GroupedDocumentModuleConfig = z.infer<
	typeof groupedDocumentModuleConfigSchema
>;

export const nonGroupedDocumentModuleConfigSchema =
	baseDocumentModuleConfigSchema.extend({
		grouped: z.literal(false),
		items: z.array(documentItemSchema),
	});

export const documentsModuleConfigSchema = z.discriminatedUnion("grouped", [
	groupedDocumentModuleConfigSchema,
	nonGroupedDocumentModuleConfigSchema,
]);

export type DocumentsModuleConfig = z.infer<typeof documentsModuleConfigSchema>;

export const documentsModuleSchema = baseModuleSchema.extend({
	type: z.literal(ModuleType.DOCUMENTS),
	config: documentsModuleConfigSchema,
});

export type DocumentsModule = z.infer<typeof documentsModuleSchema>;
