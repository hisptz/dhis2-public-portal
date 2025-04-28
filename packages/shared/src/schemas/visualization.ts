import { z } from "zod";

export const visualizationFields = [
	"access",
	"aggregationType",
	"axes",
	"colSubTotals",
	"colTotals",
	"colorSet",
	"columns[dimension,filter,legendSet[id,name,displayName,displayShortName,legends[id,color,startValue,endValue]],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]]",
	"completedOnly",
	"created",
	"cumulative",
	"cumulativeValues",
	"dataDimensionItems[dataDimensionItemType,expressionDimensionItem[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],dataElement[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],dataElementOperand[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],reportingRate[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],programAttribute[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],programIndicator[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],indicator[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access],programDataElement[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]]",
	"description",
	"digitGroupSeparator",
	"displayDensity",
	"displayDescription",
	"displayName",
	"displayShortName",
	"displaySubtitle",
	"displayTitle",
	"favorite",
	"favorites",
	"filters[dimension,filter,legendSet[id,name,displayName,displayShortName,legends[id,color,startValue,endValue]],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]]",
	"fixColumnHeaders",
	"fixRowHeaders",
	"fontSize",
	"fontStyle",
	"hideEmptyColumns",
	"hideEmptyRowItems",
	"hideEmptyRows",
	"hideSubtitle",
	"hideTitle",
	"href",
	"icons",
	"id",
	"interpretations[id,created]",
	"lastUpdated",
	"lastUpdatedBy",
	"legend[showKey,style,strategy,set[id,name,displayName,displayShortName]]",
	"measureCriteria",
	"name",
	"noSpaceBetweenColumns",
	"numberType",
	"outlierAnalysis",
	"parentGraphMap",
	"percentStackedValues",
	"publicAccess",
	"regression",
	"regressionType",
	"reportingParams",
	"rowSubTotals",
	"rowTotals",
	"rows[dimension,filter,legendSet[id,name,displayName,displayShortName,legends[id,color,startValue,endValue]],items[dimensionItem~rename(id),name,displayName,displayShortName,dimensionItemType,expression,access]]",
	"series",
	"seriesKey",
	"shortName",
	"showData",
	"showDimensionLabels",
	"showHierarchy",
	"skipRounding",
	"sortOrder",
	"sorting",
	"subscribed",
	"subscribers",
	"subtitle",
	"timeField",
	"title",
	"topLimit",
	"translations",
	"type",
	"user[name,displayName,displayShortName,userCredentials[username]]",
	"userAccesses",
	"userGroupAccesses",
	"yearlySeries",
	"!attributeDimensions",
	"!attributeValues",
	"!category",
	"!categoryDimensions",
	"!categoryOptionGroupSetDimensions",
	"!code",
	"!columnDimensions",
	"!dataElementDimensions",
	"!dataElementGroupSetDimensions",
	"!externalAccess",
	"!filterDimensions",
	"!itemOrganisationUnitGroups",
	"!organisationUnitGroupSetDimensions",
	"!organisationUnitLevels",
	"!organisationUnits",
	"!periods",
	"!programIndicatorDimensions",
	"!relativePeriods",
	"!rowDimensions",
	"!userOrganisationUnit",
	"!userOrganisationUnitChildren",
	"!userOrganisationUnitGrandChildren",
];

export enum DefaultAnalyticsDimension {
	ou = "ou",
	dx = "dx",
	pe = "pe",
	co = "co",
}

export const analyticsDimensionSchema = z.union([
	z.nativeEnum(DefaultAnalyticsDimension),
	z.string().max(11).min(11),
]);
export type AnalyticsDimensionSchema = z.infer<typeof analyticsDimensionSchema>;

export enum VisualizationChartType {
	BAR = "BAR",
	LINE = "LINE",
	PIE = "PIE",
	TABLE = "PIVOT_TABLE",
	GAUGE = "GAUGE",
	SINGLE_VALUE = "SINGLE_VALUE",
	COLUMN = "COLUMN",
	STACKED_COLUMN = "STACKED_COLUMN",
	STACKED_BAR = "STACKED_BAR",
	LINE_LIST = "LINE_LIST",
	AREA = "AREA",
	STACKED_AREA = "STACKED_AREA",
	RADAR = "RADAR",
	YEAR_OVER_YEAR_LINE = "YEAR_OVER_YEAR_LINE",
	YEAR_OVER_YEAR_COLUMN = "YEAR_OVER_YEAR_COLUMN",
	SCATTER = "SCATTER",
	BUBBLE = "BUBBLE",
}

export enum DataDimensionItemType {
	INDICATOR = "INDICATOR",
	DATA_ELEMENT = "DATA_ELEMENT",
	REPORTING_RATE = "REPORTING_RATE",
	DATA_ELEMENT_OPERAND = "DATA_ELEMENT_OPERAND",
	PROGRAM_DATA_ELEMENT = "PROGRAM_DATA_ELEMENT",
	PROGRAM_INDICATOR = "PROGRAM_INDICATOR",
}

export enum DigitGroupSeparator {
	SPACE = "SPACE",
}

export enum DisplayDensity {
	NORMAL = "NORMAL",
	COMPACT = "COMPACT",
}

export enum AggregationType {
	DEFAULT = "DEFAULT",
	AVERAGE = "AVERAGE",
	MAX = "MAX",
	STDDEV = "STDDEV",
}

export enum RegressionType {
	NONE = "NONE",
	LINEAR = "LINEAR",
}

const accessSchema = z.object({
	delete: z.boolean(),
	externalize: z.boolean(),
	manage: z.boolean(),
	read: z.boolean(),
	update: z.boolean(),
	write: z.boolean(),
});

const legendSet = z.object({
	id: z.string(),
	name: z.string(),
	displayName: z.string(),
	displayShortName: z.string(),
	legends: z.array(
		z.object({
			id: z.string(),
			color: z.string(),
			startValue: z.number(),
			endValue: z.number(),
		}),
	),
});

const dimensionItem = z.object({
	id: z.string(),
	name: z.string(),
	displayName: z.string(),
	displayShortName: z.string().optional(),
	dimensionItemType: z.string().optional(),
	expression: z.string().optional(),
	access: accessSchema,
	legendSet: legendSet.optional(),
});

const dataDimensionItem = z.object({
	id: z.string(),
	name: z.string(),
	displayName: z.string(),
	displayShortName: z.string().optional(),
	expression: z.string().optional(),
	access: accessSchema,
	dimensionItemType: z.string(),
});

export type DataDimensionItem = z.infer<typeof dataDimensionItem>;

const dimension = z.object({
	dimension: analyticsDimensionSchema,
	filter: analyticsDimensionSchema.optional(),
	items: z.array(dimensionItem),
	legendSet: legendSet.optional(),
});

export type DimensionConfig = z.infer<typeof dimension>;

export const visualizationSchema = z.object({
	access: accessSchema,
	aggregationType: z.nativeEnum(AggregationType),
	colSubTotals: z.boolean(),
	colTotals: z.boolean(),
	columns: z.array(dimension),
	completedOnly: z.boolean(),
	created: z.string(),
	cumulativeValues: z.boolean(),
	dataDimensionItems: z.array(
		z.object({
			dataDimensionItemType: z.nativeEnum(DataDimensionItemType),
			expressionDimensionItem: dataDimensionItem.optional(),
			dataElement: dataDimensionItem.optional(),
			dataElementOperand: dataDimensionItem.optional(),
			reportingRate: dataDimensionItem.optional(),
			programAttribute: dataDimensionItem.optional(),
			programIndicator: dataDimensionItem.optional(),
			indicator: dataDimensionItem.optional(),
		}),
	),
	description: z.string().optional(),
	displayDescription: z.string().optional(),
	digitGroupSeparator: z.nativeEnum(DigitGroupSeparator),
	displayDensity: z.nativeEnum(DisplayDensity),
	displayName: z.string(),
	displayShortName: z.string().optional(),
	displaySubtitle: z.string().optional(),
	favorite: z.boolean(),
	favorites: z.array(z.string()).optional(),
	filters: z.array(dimension),
	fixColumnHeaders: z.boolean(),
	fixRowHeaders: z.boolean(),
	fontSize: z.nativeEnum(DisplayDensity),
	fontStyle: z.record(z.string(), z.any()).optional(),
	hideEmptyColumns: z.boolean(),
	hideEmptyRowItems: z.string().optional(),
	hideEmptyRows: z.boolean(),
	hideSubtitle: z.boolean(),
	hideTitle: z.boolean(),
	href: z.string().url(),
	icons: z.array(z.string()),
	id: z.string(),
	interpretations: z.array(
		z.object({
			id: z.string(),
			created: z.string(),
		}),
	),
	lastUpdated: z.string(),
	lastUpdatedBy: z
		.object({
			id: z.string(),
		})
		.optional(),
	legend: z
		.object({
			showKey: z.boolean(),
			style: z.string().optional(),
			strategy: z.string().optional(),
			set: z
				.object({
					id: z.string(),
					name: z.string(),
					displayName: z.string(),
					displayShortName: z.string().optional(),
				})
				.optional(),
		})
		.optional(),
	measureCriteria: z.string().optional(),
	name: z.string(),
	noSpaceBetweenColumns: z.boolean().optional(),
	numberType: z.string().optional(),
	parentGraphMap: z.object({}).optional(),
	outlierAnalysis: z.object({}).optional(),
	percentStackedValues: z.boolean(),
	publicAccess: z.string().optional(),
	regression: z.boolean(),
	regressionType: z.nativeEnum(RegressionType).optional(),
	reportingParams: z.object({
		grandParentOrganisationUnit: z.boolean(),
		organisationUnit: z.boolean(),
		parentOrganisationUnit: z.boolean(),
		reportingPeriod: z.boolean(),
	}),
	rowSubTotals: z.boolean(),
	rowTotals: z.boolean(),
	rows: z.array(dimension),
	series: z.array(z.object({})).optional(),
	seriesKey: z.object({
		hidden: z.boolean(),
	}),
	shortName: z.string().optional(),
	showData: z.boolean(),
	showDimensionLabels: z.boolean(),
	showHierarchy: z.boolean(),
	skipRounding: z.boolean(),
	sortOrder: z.number(),
	sorting: z.array(z.string()),
	subscribed: z.boolean(),
	subscribers: z.array(z.string()),
	subtitle: z.string().optional(),
	timeField: z.string().optional(),
	title: z.string().optional(),
	topLimit: z.number(),
	translations: z.array(z.object({})),
	type: z.nativeEnum(VisualizationChartType),
	yearlySeries: z.array(z.string()),
});

const supportedVisualizations = ["MAP", "chart", "table"] as const;

export type SupportedVisualization = (typeof supportedVisualizations)[number];

export type VisualizationConfig = z.infer<typeof visualizationSchema>;
