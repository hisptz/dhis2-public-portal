import { dhis2HttpClient } from "@/utils/api/dhis2";
import { findIndex, head } from "lodash";
import { NumberFormatter, Title } from "@mantine/core";
import { getAppearanceConfig } from "@/utils/config/appConfig";

async function getVisualizationData(visualization: VisualizationConfig) {
	const dataItem = head(head(visualization.columns)?.items ?? [])?.id;
	const period = getPeriods(visualization);

	const dimension = `dx:${dataItem}`;
	const filter = `pe:${period},ou:USER_ORGUNIT`;
	const data = await dhis2HttpClient.get<{
		headers: Array<{ name: string }>;
		rows: string[];
	}>(`analytics`, {
		params: {
			dimension,
			filter,
		},
	});

	const getData = () => {
		if (!data) {
			return;
		}
		const { headers, rows } = data ?? {};
		const valueIndex = findIndex(headers, ["name", "value"]);
		return head(rows as string[])?.[valueIndex] ?? "";
	};

	return parseFloat(getData() ?? "");
}

export async function HighlightedValueDisplay({
	visualizationConfig,
}: {
	visualizationConfig: VisualizationConfig;
}) {
	const data = await getVisualizationData(visualizationConfig);
	const appearanceConfig = await getAppearanceConfig();
	const color = appearanceConfig?.appearanceConfig.colors.chartColors[0];

	return (
		<Title style={{ color }} className={`!text-5xl`} order={1}>
			<NumberFormatter thousandSeparator value={data} decimalScale={2} />
		</Title>
	);
}
