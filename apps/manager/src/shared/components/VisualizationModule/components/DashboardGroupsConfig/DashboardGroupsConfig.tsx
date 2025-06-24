import React from "react";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Divider,
	IconDelete16,
	IconEdit16,
} from "@dhis2/ui";
import { DashboardGroups } from "./components/DashboardGroups";
import { useFieldArray, useWatch } from "react-hook-form";
import { AddGroup } from "../AddGroup/AddGroup";
import { useNavigate, useParams } from "@tanstack/react-router";
import { VisualizationModule } from "@packages/shared/schemas";
import { RichContent } from "../../../RichContent";

export function DashboardGroupsConfig() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const navigate = useNavigate();
	const hasGroups = useWatch<VisualizationModule, "config.grouped">({
		name: "config.grouped",
	});
	const { fields, append, remove } = useFieldArray<
		VisualizationModule,
		"config.groups"
	>({
		name: "config.groups",
	});

	if (!hasGroups) {
		return null;
	}
	const groups = fields.map((field, index) => ({
		...field,
		shortDescription: RichContent({
			content: field.shortDescription ?? "",
			maxLength: 500,
		}),
		description: RichContent({
			content: field.description ?? "",
			maxLength: 500,
		}),
		actions: (
			<ButtonStrip>
				<Button
					dataTest={`edit-group-${index}`}
					onClick={() =>
						navigate({
							to: "/modules/$moduleId/edit/$groupIndex",
							params: {
								moduleId,
								groupIndex: index,
							},
						})
					}
					icon={<IconEdit16 />}
				/>
				<Button
					dataTest={`remove-group-${index}`}
					onClick={() => remove(index)}
					title={i18n.t("Remove")}
					icon={<IconDelete16 />}
				/>
			</ButtonStrip>
		),
	}));

	return (
		<div className="flex-1 w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl">{i18n.t("Groups")}</h3>
				<AddGroup
					onAdd={(data) => {
						append(data);
						navigate({
							to: "/modules/$moduleId/edit/$groupIndex",
							params: {
								moduleId,
								groupIndex: fields.length,
							},
						});
					}}
				/>
			</div>
			<Divider />
			<DashboardGroups groups={groups} />
		</div>
	);
}
