import React, { useCallback } from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	IconLayoutColumns24,
} from "@dhis2/ui";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { mapValues } from "lodash";
import {
	DisplayItem,
	FlexibleLayoutConfig,
	DocumentGroup,
	DisplayItemType,
	DocumentsModule,
} from "@packages/shared/schemas";
import { useNavigate, useParams } from "@tanstack/react-router";
import { DashboardVisualizations } from "../../VisualizationModule/components/DashboardVisualizationsConfig/components/DashboardVisualizations";
import { AddLibrary } from "./AddDocument/AddLibrary";
import { AddVisualization } from "../../VisualizationModule/components/AddVisualization/AddVisualization";

export function DocumentGroupItemConfig() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const { setValue, getValues } = useFormContext<DocumentsModule>();
	const navigate = useNavigate();
	const hasGroups = useWatch<DocumentsModule, "config.grouped">({
		name: "config.grouped",
	});

	const { fields, append, update, remove } = useFieldArray<
		DocumentsModule,
		"config.groups"
	>({
		name: "config.groups",
		keyName: "fieldId" as unknown as "id",
	});

	const onAddDocumentGroup = useCallback(
		(document: DocumentGroup) => {
			// const displayItem: DisplayItem = {
			// 	type: DisplayItemType.VISUALIZATION,
			// 	item: visualization,
			// };
			append(document);
			
		},
		[append, getValues, setValue],
	);

	if (!hasGroups) {
		return null;
	}

	const rows = fields
		.map((field, index) => {
			// const visualizationField = field as DisplayItem & {
			// 	type: DisplayItemType.VISUALIZATION;
			// 	item: DocumentGroup;
			// };

			return {
				...field,
				actions: (
					<ButtonStrip key={field.id}>
						{/* <EditVisualization
							visualization={visualizationField.item}
							onUpdate={(data) =>
								update(index, {
									...visualizationField,
									item: data,
								})
							}
						/> */}
						<Button
							onClick={() => remove(index)}
							title={i18n.t("Remove")}
							icon={<IconDelete16 />}
						/>
					</ButtonStrip>
				),
			};
		});

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Document Group")}</h3>
				<ButtonStrip end>
					
					{/* <AddLibrary  onAdd={onAddVisualization} /> */}
					{/* <AddVisualization onAdd={onAddVisualization} /> */}
				</ButtonStrip>
			</div>
			<Divider />
			{/* <DocumentListConfig visualizations={rows} /> */}
		</div>
	);
}
