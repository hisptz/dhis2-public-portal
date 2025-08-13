import { z } from "zod";

export const dataDownloadSummary = z.object({
	id: z.string(),
	type: z.literal("download"),
	periods: z.string().array().optional(),
	dataItems: z.string().array().optional(),
	status: z.enum(["SUCCESS", "FAILED", "DONE", "INIT"]),
	timestamp: z.string(),
	count: z.number().optional(),
	error: z.string().optional(),
	errorDetails: z.record(z.string(), z.unknown()).optional(),
});

export type DataDownloadSummary = z.infer<typeof dataDownloadSummary>;
export const dataDownloadSummaryList = z.array(dataDownloadSummary);
export type DataDownloadSummaryList = z.infer<typeof dataDownloadSummaryList>;

export const dataUploadSummary = z.object({
	filename: z.string().optional(),
	type: z.literal("upload"),
	status: z.enum(["SUCCESS", "FAILED", "DONE", "INIT"]),
	timestamp: z.string(),
	error: z.string().optional(),
	errorDetails: z.record(z.string(), z.unknown()).optional(),
	importSummary: z
		.object({
			imported: z.number(),
			ignored: z.number(),
		})
		.optional(),
});
export type DataUploadSummary = z.infer<typeof dataUploadSummary>;

export const processSummarySchema = z
	.discriminatedUnion("type", [dataDownloadSummary, dataUploadSummary])
	.and(z.object({ configId: z.string() }));

export type ProcessSummary = z.infer<typeof processSummarySchema>;
