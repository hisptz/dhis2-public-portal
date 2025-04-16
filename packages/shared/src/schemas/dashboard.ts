import { z } from "zod";
import i18n from "@dhis2/d2-i18n";

export enum VisualizationType {
	CHART = "CHART",
	REPORT_TABLE = "REPORT_TABLE",
	MAP = "MAP",
	PDF = "PDF",
	DOC = "DOC",
	ZIP = "ZIP",
	CASCADE = "CASCADE",
	SINGLE_VALUE = "SINGLE_VALUE",
	GAUGE = "GAUGE",
	MULTI_CHART = "MULTI_CHART",
	BANNER = "BANNER",
	PYRAMID = "PYRAMID",
}

const chartAxisSchema = z.object({
	id: z.string(),
	type: z.string(),
	multiple: z.boolean().optional(),
	name: z.string().optional(),
	ids: z.array(z.string()).optional(),
});

export const periodConfigSchema = z.object({
	categories: z.array(z.enum(["RELATIVE", "FIXED"])).optional(),
	periodTypes: z.array(z.string()).optional(),
	periods: z.array(z.string()).optional(),
	singleSelection: z.boolean().optional(),
});

export type PeriodConfig = z.infer<typeof periodConfigSchema>;

export const orgUnitConfigSchema = z.object({
	orgUnitLevels: z.array(z.number()).optional(),
	orgUnits: z.array(z.string()).optional(),
});

export type OrgUnitConfig = z.infer<typeof orgUnitConfigSchema>;

export const dataGridSchema = z.object({
	i: z.string(),
	x: z.number().min(0).max(12).optional(),
	y: z.number().min(0).optional(),
	w: z.number().min(1).max(12).optional(),
	h: z.number().min(1).optional(),
	static: z.boolean().optional(),
	minW: z.number().min(1).max(12).optional(),
	maxW: z.number().min(1).max(12).optional(),
	minH: z.number().min(1).max(12).optional(),
	maxH: z.number().min(1).max(12).optional(),
});

export const layoutSchema = z.object({
	lg: dataGridSchema.array().optional(),
	md: dataGridSchema.array().optional(),
	sm: dataGridSchema.array().optional(),
	xs: dataGridSchema.array().optional(),
});

export const visualizationSchema = z.object({
	type: z.enum([
		VisualizationType.CHART,
		VisualizationType.REPORT_TABLE,
		VisualizationType.MAP,
		VisualizationType.DOC,
		VisualizationType.ZIP,
		VisualizationType.PDF,
		VisualizationType.GAUGE,
		VisualizationType.PYRAMID,
	]),
	id: z.string(),
	periodConfig: periodConfigSchema.optional(),
	orgUnitConfig: orgUnitConfigSchema.optional(),
	caption: z.string().optional(),
});

const singleValueVisualizationSchema = visualizationSchema.extend({
	type: z.literal(VisualizationType.SINGLE_VALUE),
	background: z.boolean().optional(),
	suffix: z.string().optional(),
});

const multiChartVisualizationSchema = visualizationSchema.extend({
	type: z.literal(VisualizationType.MULTI_CHART),
	axes: z.array(chartAxisSchema),
});
const cascadeVisualizationSchema = visualizationSchema.extend({
	type: z.literal(VisualizationType.CASCADE),
	axes: z.array(chartAxisSchema),
});

const bannerVisualizationSchema = visualizationSchema.extend({
	type: z.literal(VisualizationType.BANNER),
	label: z.string(),
	data: z
		.object({
			id: z.string(),
			percentage: z.boolean().optional(),
		})
		.array(),
});

export const dashboardVisualizationSchema = z.discriminatedUnion("type", [
	visualizationSchema,
	multiChartVisualizationSchema,
	cascadeVisualizationSchema,
	bannerVisualizationSchema,
	singleValueVisualizationSchema,
]);

const baseDashboardGroupSchema = z.object({
	label: z.string(),
	labelDescription: z.string().optional(),
	id: z.string(),
	hasSubGroup: z.boolean().optional(),
	description: z.string().optional(),
	shortDescription: z.string().optional(),
	visualizations: z.array(dashboardVisualizationSchema).optional(),
	highlights: dashboardVisualizationSchema.array().optional(),
	periodConfig: periodConfigSchema.optional(),
	orgUnitConfig: orgUnitConfigSchema.optional(),
	layouts: layoutSchema.optional(),
});
export const dashboardGroupSchema = baseDashboardGroupSchema.extend({
	subGroups: z.lazy(() => z.array(baseDashboardGroupSchema)).optional(),
});

export const dashboardSchema = z.object({
	title: z.string(),
	id: z
		.string()
		.regex(/^\S*$/, { message: i18n.t("ID should not contain a space") }),
	hasSubGroup: z.boolean(),
	groups: z.array(dashboardGroupSchema),
	visualizations: z.array(dashboardVisualizationSchema).optional(),
	layouts: layoutSchema.optional(),
	description: z.string().optional(),
	shortDescription: z.string().optional(),
	highlights: dashboardVisualizationSchema.array().optional(),
	periodConfig: periodConfigSchema.optional(),
	orgUnitConfig: orgUnitConfigSchema.optional(),
	sortOrder: z.number(),
});
export type DashboardLayout = z.infer<typeof layoutSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
export type DashboardGroup = z.infer<typeof dashboardGroupSchema>;
export type DashboardVisualization = z.infer<
	typeof dashboardVisualizationSchema
>;

export type SingleValueVisualization = z.infer<
	typeof singleValueVisualizationSchema
>;
export type Visualization = z.infer<typeof visualizationSchema>;
export type MultiChartVisualization = z.infer<
	typeof multiChartVisualizationSchema
>;
export type CascadeChartVisualization = z.infer<
	typeof cascadeVisualizationSchema
>;
export type BannerVisualization = z.infer<typeof bannerVisualizationSchema>;
