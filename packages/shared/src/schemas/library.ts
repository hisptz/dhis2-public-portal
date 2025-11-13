import { z } from "zod";

export const libraryFilesSchema = z.object({
	id: z.string(),
	label: z.string(),
	type: z.enum(["PDF", "DOCX", "ZIP", "XLSX", "TXT"]),
});

export const baseLibraryGroupSchema = z.object({
	id: z.string(),
	label: z.string(),
	files: z.array(libraryFilesSchema).optional(),
});

export const libraryGroupSchema = baseLibraryGroupSchema.extend({
	subGroups: z.array(baseLibraryGroupSchema).optional(),
});
export const librarySchema = z.object({
	id: z.string(),
	label: z.string(),
	labelDescription: z.string().optional(),
	groups: z.array(libraryGroupSchema),
	sortOrder: z.number(),
});

export type LibraryData = z.infer<typeof librarySchema>;
export type LibraryGroupData = z.infer<typeof libraryGroupSchema>;
export type LibraryFileData = z.infer<typeof libraryFilesSchema>;
