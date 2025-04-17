import { z } from "zod";
import { visualizationSchema } from "./dashboard";

const surveyDataSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().optional(),
	icon: z.string(),
	dashboardItems: z.array(visualizationSchema),
});

const surveyVisualizationSchema = z.object({
	id: z.string(),
	periods: z.array(z.string()),
	name: z.string(),
	dataDimensionItems: z.array(
		z.record(z.string(), z.object({ id: z.string() })),
	),
});

export type SurveyVisualization = z.infer<typeof surveyVisualizationSchema>;

export type SurveyData = z.infer<typeof surveyDataSchema>;
