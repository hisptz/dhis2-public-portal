import { z } from "zod";

export const analyticsSchema = z.object({
	headers: z.array(
		z.object({
			name: z.string(),
			column: z.string(),
			valueType: z.string(),
		}),
	),
	rows: z.array(z.string().array()),
	metaData: z.object({
		items: z.record(z.string(), z.record(z.string(), z.any())),
		dimensions: z.record(z.string(), z.array(z.string())),
	}),
});

export type AnalyticsData = z.infer<typeof analyticsSchema>;
