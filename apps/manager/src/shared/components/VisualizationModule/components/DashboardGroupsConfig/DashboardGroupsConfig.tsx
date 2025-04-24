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
import { VisualizationModuleConfig } from "@packages/shared/schemas";

export function DashboardGroupsConfig() {
	const hasGroups = useWatch<VisualizationModuleConfig>({
		name: "grouped",
	});
	const { fields, append, remove } = useFieldArray<VisualizationModuleConfig, "groups">({
		name: "groups",
	});

	if (!hasGroups) {
		return null;
	}

	const groups = fields.map((field, index) => {
		return {
			...field,
			actions: (
				<ButtonStrip>
					<Button
						onClick={() => {
							// TODO: Implement navigation logic here
						}}
						icon={<IconEdit16 />}
					/>
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
				<h3 className="text-2xl">{i18n.t("Groups")}</h3>
				<AddGroup
					onAdd={(data) => {
						append(data);
							// TODO: Implement navigation logic here
						}}
				/>
			</div>
			<Divider />
			<DashboardGroups groups={groups} />
		</div>
	);
}
