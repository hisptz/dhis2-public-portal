import {
	AnalyticsData,
	VisualizationConfig,
	YearOverYearVisualizationConfig,
} from "@packages/shared/schemas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { getVisualizationDimensions, getVisualizationFilters } from "../utils";

type Dimension = "ou" | "pe" | "dx" | string;

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
	const searchParams = useSearchParams();
	const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
	const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
	const { refetch, loading, data } = useDataQuery<{
		analytics: AnalyticsData;
	}>(analyticsQuery, { lazy: true });

	//Get the selected relative period
	const selectedRelativePeriods = Object.entries(
		visualizationConfig.relativePeriods || {},
	)
		.filter(([_, value]) => value === true)
		.map(([key]) => key);
	console.log(selectedRelativePeriods);
	// get the dx and ou
	const yearlySeries = visualizationConfig.yearlySeries || [];
	const orgUnitFilter = (visualizationConfig.filters || []).find(
		(filter: any) => filter.dimension === "ou",
	);
	const orgUnits = orgUnitFilter
		? orgUnitFilter.items.map((item: any) => item.id)
		: [];


	// Prepare analytics query per each yearly series available
	useEffect(() => {
		async function fetchYearlyAnalytics() {
			const filters = getVisualizationFilters(
				visualizationConfig as VisualizationConfig,
				{
					selectedOrgUnits: orgUnits,
					selectedPeriods: selectedRelativePeriods,
				},
			);

			for (const yearId of yearlySeries) {
				await refetch({
					filters,
					dimensions: {
						ou: orgUnits,
						pe: [yearId],
					},
				});
			}
		}
	}, [visualizationConfig, orgUnits, selectedRelativePeriods, yearlySeries, refetch]);

	return {
		analytics: data?.analytics,	
		loading,
		setSelectedPeriods,
		setSelectedOrgUnits,
		selectedPeriods,
		selectedOrgUnits,
	};
}
