import {
	AnalyticsData,
	bannerVisualizationItem as BannerVisualizationType,
} from "@packages/shared/schemas";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { find, findIndex } from "lodash";
import { SingleValue } from "@hisptz/dhis2-analytics";
import { mainColors } from "@packages/shared/constants";
import { Banner } from "@/components/displayItems/visualizations/Banner";

export interface BannerVisualizationProps {
	config: BannerVisualizationType;
	disableActions?: boolean;
}

async function getData({
	config,
	periods,
	orgUnits,
}: {
	config: BannerVisualizationType;
	orgUnits: string[];
	periods: string[];
}): Promise<SingleValue[] | undefined> {
	try {
		const ids = config.data.map((item) => item.id);

		const params = {
			filter: `pe:${periods.join(";")},ou:${orgUnits.join(";")}`,
			dimension: `dx:${ids.join(";")}`,
			includeMetadataDetails: "true",
		};

		const analytics = await dhis2HttpClient.get<AnalyticsData>(
			`analytics`,
			{
				params,
			},
		);

		const valueIndex = findIndex(analytics?.headers, ["name", "value"]);

		return config.data.map(({ id, percentage }) => {
			const meta = analytics?.metaData?.items[id];

			const value =
				find(analytics?.rows, (row) => {
					return row.includes(id);
				}) ?? [];

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
	} catch (error) {
		return;
	}
}

export async function BannerVisualization({
	config,
	disableActions = false,
}: BannerVisualizationProps) {
	const data = await getData({
		config,
		periods: ["2023"],
		orgUnits: ["USER_ORGUNIT"],
	});

	if (!data) {
		return null;
	}

	return (
		<div className="w-full min-h-[200px] p-4 flex flex-col justify-center items-stretch">
			<Banner title={config.label} items={data} />
		</div>
	);
}
