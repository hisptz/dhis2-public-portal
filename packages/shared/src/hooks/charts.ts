import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { useQuery } from "react-query";
import { getVisualizationDimensions, getVisualizationFilters } from "../utils";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { head } from "lodash";

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
	visualizationConfig: VisualizationConfig;
}) {
	const [data, setData] = useState<AnalyticsData>();
	const searchParams = useSearchParams();
	const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
	const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

	const { refetch } = useDataQuery<{
		analytics: AnalyticsData;
	}>(analyticsQuery, {
		lazy: true,
	});

	const { isLoading: loading } = useQuery({
		queryKey: [
			searchParams,
			selectedOrgUnits,
			selectedPeriods,
			visualizationConfig,
		],
		queryFn: async () => {
			const updatedSearchParams = new Map(searchParams);
			const filters = getVisualizationFilters(visualizationConfig, {
				searchParams: updatedSearchParams,
				selectedOrgUnits,
				selectedPeriods,
			});
			const years = visualizationConfig.yearlySeries;
			for (const yearId of years) {
				const year = PeriodUtility.getPeriodById(yearId);
				const relativePeriodDate = year.get()?.start.toString();
				const yearData = (await refetch({
					filters,
					dimensions: {
						pe: head(visualizationConfig.rows)?.items.map(
							({ id }) => id,
						),
					},
					relativePeriodDate,
				})) as { analytics: AnalyticsData };

				setData((prev) => {
					return {
						...(prev ?? yearData.analytics),
						rows: [
							...(prev?.rows ?? []),
							...yearData.analytics.rows,
						],
						metaData: {
							dimensions: {
								...yearData.analytics.metaData.dimensions,
								pe: [
									...(prev?.metaData.dimensions.pe ?? []),
									...yearData.analytics.metaData.dimensions
										.pe,
								],
							},
							items: {
								...(prev?.metaData?.items ?? {}),
								...yearData.analytics.metaData.items,
							},
						},
					};
				});
			}
			return null;
		},
	});

	return {
		loading,
		analytics: data,
		refetch,
		setSelectedPeriods,
		setSelectedOrgUnits,
		selectedPeriods,
		selectedOrgUnits,
	};
}
