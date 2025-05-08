import React from "react";
import { Divider } from "@dhis2/ui";
import { useFieldArray } from "react-hook-form";
import { SectionModuleConfig } from "@packages/shared/schemas";
import { FeedbackList } from "./components/FeedbackList";
import { AddFeedback } from "./components/AddFeedback/AddFeedback";

export function FeedbackItemConfig({
	namePrefix,
}: {
	namePrefix: `config.sections.${number}.item`;
}) {
	const { fields, append, update, remove } = useFieldArray<
		SectionModuleConfig,
		`config.sections.${number}.item.item.recipients`
	>({
		name: `${namePrefix}.item.recipients`,
		keyName: "fieldId" as unknown as "id",
	});

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-end">
				<AddFeedback onAdd={append} />
			</div>
			<Divider />
			<FeedbackList
				recipients={fields}
				onEdit={(feedback, index) => update(index, feedback)}
				onRemove={remove}
			/>
		</div>
	);
}
