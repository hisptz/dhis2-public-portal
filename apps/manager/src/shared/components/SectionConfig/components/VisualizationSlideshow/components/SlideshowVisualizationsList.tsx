import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import { SlideshowVisualization } from "@packages/shared/schemas";
import { Button, ButtonStrip, IconDelete16 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { EditSlideshowVisualizationItem } from "./AddSlideshowVisualizationItem/components/EditSlideshowVisualizationItem";

const columns: SimpleTableColumn[] = [
	{
		label: "Visualization",
		key: "visualization",
	},
	{
		label: "Type",
		key: "type",
	},
	{
		label: "Actions",
		key: "actions",
	},
];

type Props = {
	visualizations: Array<SlideshowVisualization>;
	onEdit: (visualization: SlideshowVisualization, index: number) => void;
	onRemove: (index: number) => void;
};

export function SlideshowVisualizationsList({
	visualizations,
	onEdit,
	onRemove,
}: Props) {
	const rows = visualizations.map((item, index) => ({
		id: `feedback-item-${index}`,
		visualization: item.id || "N/A",
		type: item.type || "N/A",
		actions: (
			<ButtonStrip key={`feedback-${index}`}>
				<EditSlideshowVisualizationItem
					visualization={item}
					onUpdate={(data) => onEdit(data, index)}
				/>
				<Button
					dataTest={"remove-feedback-button"}
					onClick={() => onRemove(index)}
					title={i18n.t("Remove")}
					icon={<IconDelete16 />}
				/>
			</ButtonStrip>
		),
	}));

	return (
		<SimpleTable
			columns={columns}
			rows={rows}
			emptyLabel={i18n.t("No slideshow visualization items configured")}
		/>
	);
}
