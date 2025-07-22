import {
	AnalyticsData,
	VisualizationConfig,
	YearOverYearVisualizationConfig,
} from "@packages/shared/schemas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { getVisualizationDimensions, getVisualizationFilters } from "../utils";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { snakeCase } from "lodash";

const analyticsQuery = {
	analytics: {
		resource: "analytics",
		params: ({ filters, dimensions, relativePeriodDate }: any) => {
			return {
				displayProperty: "NAME",
				filter: Object.keys(filters).map(
					(key) => `${key}:${filters[key]?.join(";")}`,
				),
				dimension: Object.keys(dimensions).map(
					(key) => `${key}:${dimensions[key]?.join(";")}`,
				),
				includeMetadataDetails: "true",
				relativePeriodDate,
			};
		},
	},
};

export function useAnalytics({
	visualizationConfig,
}: {
	visualizationConfig: VisualizationConfig;
}) {
	const searchParams = useSearchParams();

	const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
	const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

	const { refetch, loading, data } = useDataQuery<{
		analytics: AnalyticsData;
	}>(analyticsQuery, {
		lazy: true,
	});

	useEffect(() => {
		const updatedSearchParams = new Map(searchParams);
		refetch({
			filters: getVisualizationFilters(visualizationConfig, {
				searchParams: updatedSearchParams,
				selectedOrgUnits,
				selectedPeriods,
			}),
			dimensions: getVisualizationDimensions(visualizationConfig, {
				searchParams: updatedSearchParams,
				selectedOrgUnits,
				selectedPeriods,
			}),
		});
	}, [refetch, searchParams, selectedOrgUnits, selectedPeriods]);
	return {
		loading,
		analytics: data?.analytics,
		refetch,
		setSelectedPeriods,
		setSelectedOrgUnits,
		selectedPeriods,
		selectedOrgUnits,
	};
}

export function useYearOverYearAnalytics({
	visualizationConfig,
}: {
	visualizationConfig: YearOverYearVisualizationConfig;
}) {
	const [data, setData] = useState<Map<string, AnalyticsData>>();
	const searchParams = useSearchParams();
	const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
	const [selectedPeriods, setSelectedPeriods] = useState<string[]>(
		searchParams?.get("pe")?.split(",") ?? [],
	);

	const { refetch, loading } = useDataQuery<{
		analytics: AnalyticsData;
	}>(analyticsQuery, { lazy: true });

	//Get the selected relative period
	const selectedRelativePeriods = Object.entries(
		visualizationConfig.relativePeriods || {},
	)
		.filter(([_, value]) => value === true)
		.map(([key]) => snakeCase(key).toUpperCase());

	// get the dx and ou
	const getYearsFromPeriods = (periods: string[]) =>
		Array.from(new Set(periods.map((pe) => pe.slice(0, 4))));

	const yearsToFetch =
		selectedPeriods.length > 0
			? getYearsFromPeriods(selectedPeriods)
			: visualizationConfig.yearlySeries || [];

	const orgUnitFilter = (visualizationConfig.filters || []).find(
		(filter: any) => filter.dimension === "ou",
	);
	const orgUnits = orgUnitFilter
		? orgUnitFilter.items.map((item: any) => item.id)
		: [];

	const dataFilter = (visualizationConfig.filters || []).find(
		(filter: any) => filter.dimension === "dx",
	);
	const dx = dataFilter ? dataFilter.items.map((item: any) => item.id) : [];

	// Prepare an analytics query per each year to fetch (dynamic)
	useEffect(() => {
		async function fetchYearlyAnalytics() {
			const yearData = new Map<string, AnalyticsData>();
			for (const yearId of yearsToFetch) {
				const date = new Date();
				const period = PeriodUtility.getPeriodById(yearId);
				const year = period.start.year;

				const periodDate = new Date(date.setFullYear(year));
				const periodDateString = `${periodDate.getFullYear()}-${periodDate.getMonth() + 1}-${periodDate.getDate() + 1}`;

				const response = (await refetch({
					filters: {
						ou:
							selectedOrgUnits.length > 0
								? selectedOrgUnits
								: orgUnits,
						dx,
					},
					relativePeriodDate: periodDateString,
					dimensions: {
						pe:
							selectedPeriods.length > 0
								? selectedPeriods
								: selectedRelativePeriods,
					},
				})) as { analytics: AnalyticsData };

				yearData.set(yearId, response.analytics);
			}
			setData(yearData);
		}

		fetchYearlyAnalytics();
	}, [selectedOrgUnits, selectedPeriods, visualizationConfig, yearsToFetch]);

	return {
		analytics: data,
		loading,
		setSelectedPeriods,
		setSelectedOrgUnits,
		selectedPeriods,
		selectedOrgUnits,
	};
}
