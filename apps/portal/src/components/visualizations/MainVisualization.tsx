//TODO: Replace this with the one from the migration

import { VisualizationItem } from "@packages/shared/schemas";
import { Group, Text } from "@mantine/core";
import { dhis2HttpClient } from "@/utils/api/dhis2";

export async function MainVisualization({
	config,
}: {
	config: VisualizationItem;
}) {
	async function getDetails() {
		const url =
			config.type === "MAP"
				? `maps/${config.id}`
				: `visualizations/${config.id}`;
		return await dhis2HttpClient.get<{ name: string }>(url);
	}

	const details = await getDetails();

	return (
		<>
			<Group justify="space-between">
				<Text fw={500}>{details.name}</Text>
			</Group>
		</>
	);
}
