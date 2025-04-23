import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import {
	getVisualizationDimensions,
	getVisualizationFilters,
} from "@/utils/visualizer";

type Dimension = "ou" | "pe" | "dx" | string;

const analyticsQuery = {
	analytics: {
		resource: "analytics",
		params: ({ filters, dimensions }: any) => {
			return {
				displayProperty: "NAME",
				filter: Object.keys(filters).map(
					(key) => `${key}:${filters[key]?.join(";")}`,
				),
				dimension: Object.keys(dimensions).map(
					(key) => `${key}:${dimensions[key]?.join(";")}`,
				),
				includeMetadataDetails: "true",
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
