import {
	AnalyticsData,
	bannerVisualizationItem as BannerVisualizationType,
} from "@packages/shared/schemas";
import { find, findIndex } from "lodash";
import { SingleValue } from "@hisptz/dhis2-analytics";
import { mainColors } from "@packages/shared/constants";
import React, { useMemo } from "react";
import { Banner } from "@packages/shared/components";
import { useDataQuery } from "@dhis2/app-runtime";
import { FullLoader } from "../../../../FullLoader";


export interface BannerVisualizationProps {
	config: BannerVisualizationType;
	periods?: string[];
	orgUnits?: string[];
}

const analyticsQuery: any = {
	analytics: {
		resource: "analytics",
		params: ({ ids, periods, orgUnits }: { ids: string[]; periods: string[]; orgUnits: string[] }) => ({
			filter: `pe:${periods.join(";")},ou:${orgUnits.join(";")}`,
			dimension: `dx:${ids.join(";")}`,
			includeMetadataDetails: "true",
		}),
	},
};

export function BannerVisualization({
	config,
	periods = ["2023"],
	orgUnits = ["USER_ORGUNIT"],
}: BannerVisualizationProps) {
	const ids = config.data.map((item) => item.id);

	const { data, loading, error } = useDataQuery<{
		analytics: AnalyticsData;
	}>(analyticsQuery, {
		variables: { ids, periods, orgUnits },
	});

	const bannerData = useMemo<SingleValue[] | undefined>(() => {
		if (!data?.analytics) {
			return undefined;
		}

		const analytics = data.analytics;
		const valueIndex = findIndex(analytics.headers, ["name", "value"]);

		return config.data.map(({ id, percentage }) => {
			const meta = analytics?.metaData?.items[id];
			const value =
				find(analytics.rows, (row) => row.includes(id)) ?? [];
			const indicatorValue = value
				? parseFloat(value[valueIndex] ?? "0")
				: 0;

			return {
				id,
				value: indicatorValue,
				label: (meta?.name as string) ?? "",
				percentage: percentage ? indicatorValue : undefined,
				color: mainColors,
				animationDuration: 1000,
				animationDelay: 100,
			};
		});
	}, [data, config.data]);

	if (loading) {
		return (
			<div className="w-full h-full flex items-center justify-center min-h-[200px]">
				<FullLoader/>
			</div>
		);
	}

	if (error || !bannerData) {
		return (
			<div className="w-full h-full flex items-center justify-center min-h-[200px]">
				<span>Error: {error?.message || "No data available"}</span>
			</div>
		);
	}

	return (
		<div className="w-full min-h-[200px] p-4 flex flex-col justify-center items-stretch">
			<Banner title={config.label} items={bannerData} />
		</div>
	);
}
