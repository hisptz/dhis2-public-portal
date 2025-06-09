import {
	HighlightedSingleValueConfig,
	VisualizationConfig,
} from "@packages/shared/schemas";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { findIndex, head } from "lodash";
import { getPeriods } from "@packages/shared/utils";
import { Title } from "@mantine/core";

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
	config,
}: {
	config: HighlightedSingleValueConfig;
}) {
	const {} = config ?? {};
	const visualizationConfig = await dhis2HttpClient.get<VisualizationConfig>(
		`visualizations/${config.id}`,
	);
	const data = await getVisualizationData(visualizationConfig);

	return <Title order={2}>{data}</Title>;
}
