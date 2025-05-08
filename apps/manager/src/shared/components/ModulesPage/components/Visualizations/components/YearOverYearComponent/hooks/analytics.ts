import { AnalyticsData, VisualizationConfig } from "@packages/shared/schemas";
import { useState, useEffect } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { getVisualizationFilters } from "@packages/shared/utils";
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

export function useYearOverYearAnalytics({
    visualizationConfig,
}: {
    visualizationConfig: VisualizationConfig;
}) {
    const [data, setData] = useState<AnalyticsData>();
    const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

    const { loading, refetch } = useDataQuery<{
        analytics: AnalyticsData;
    }>(analyticsQuery, {
        lazy: true,
        onComplete: (result) => {
            setData((prev) => {
                const yearData = result.analytics;
                return {
                    ...(prev ?? yearData),
                    rows: [...(prev?.rows ?? []), ...yearData.rows],
                    metaData: {
                        dimensions: {
                            ...yearData.metaData.dimensions,
                            pe: [
                                ...(prev?.metaData.dimensions.pe ?? []),
                                ...yearData.metaData.dimensions.pe,
                            ],
                        },
                        items: {
                            ...(prev?.metaData?.items ?? {}),
                            ...yearData.metaData.items,
                        },
                    },
                };
            });
        },
        onError: (error) => {
            console.error("Error fetching analytics data:", error);
        },
    });

    useEffect(() => {
        async function fetchData() {
            const filters = getVisualizationFilters(visualizationConfig, {
                selectedOrgUnits,
                selectedPeriods,
            });
            const years = visualizationConfig.yearlySeries;

            for (const yearId of years) {
                const year = PeriodUtility.getPeriodById(yearId);
                const relativePeriodDate = year.get()?.start.toString();
                await refetch({
                    filters,
                    dimensions: {
                        pe: head(visualizationConfig.rows)?.items.map(
                            ({ id }) => id,
                        ),
                    },
                    relativePeriodDate,
                });
            }
        }

        fetchData().catch((error) => {
            console.error("Error in fetchData:", error);
        });
    }, [visualizationConfig, selectedOrgUnits, selectedPeriods, refetch]);
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