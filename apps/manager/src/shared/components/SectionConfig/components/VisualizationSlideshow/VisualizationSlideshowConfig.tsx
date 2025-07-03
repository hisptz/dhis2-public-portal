import React from "react";
import { Divider } from "@dhis2/ui";
import { useFieldArray } from "react-hook-form";
import { SectionModuleConfig } from "@packages/shared/schemas";
import { SlideshowVisualizationsList } from "./components/SlideshowVisualizationsList";
import { AddSlideshowVisualizationItem } from "./components/AddSlideshowVisualizationItem/AddSlideshowVisualizationItem";

export function VisualizationSlideshowConfig({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
	const { fields, append, update, remove } = useFieldArray<
		SectionModuleConfig,
		`config.sections.${number}.item.item.visualizations`
	>({
		name: `${namePrefix}.item.visualizations`,
		keyName: "fieldId" as unknown as "id",
	});

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-end">
				<AddSlideshowVisualizationItem onAdd={append} />
			</div>
			<Divider />
			<SlideshowVisualizationsList
				visualizations={fields}
				onEdit={(feedback, index) => update(index, feedback)}
				onRemove={remove}
			/>
		</div>
	);
}
