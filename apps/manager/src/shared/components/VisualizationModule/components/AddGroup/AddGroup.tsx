import { useBoolean } from "usehooks-ts";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
 import { AddGroupForm } from "./AddGroupForm";
import { VisualizationGroup, VisualizationModule } from "@packages/shared/schemas";
import { useModule } from "../../../ModulesPage/providers/ModuleProvider";

export function AddGroup({
	onAdd,
}: {
	onAdd: (group: VisualizationGroup) => void;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);
	const module = useModule() as VisualizationModule;
	const groups = module?.config.grouped ? module.config.groups : [];

	return (
		<>
			{!hide && (
				<AddGroupForm hide={hide} onClose={onHide} onAdd={onAdd} sortOrder={groups.length}/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add group")}
			</Button>
		</>
	);
}
