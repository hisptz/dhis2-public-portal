import { useBoolean } from "usehooks-ts";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { AddSectionForm } from "./AddSectionForm";
import {
	BaseSectionConfig,
	SectionModuleConfig,
} from "@packages/shared/schemas";
import { useModule } from "../../../ModulesPage/providers/ModuleProvider";

export function AddSection({
	onAdd,
}: {
	onAdd: (group: BaseSectionConfig) => void;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);
	const module = useModule() as SectionModuleConfig;
	const sections = module.config?.sections ?? [];

	return (
		<>
			{!hide && (
				<AddSectionForm
					hide={hide}
					onClose={onHide}
					onAdd={onAdd}
					sortOrder={sections.length}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add Section")}
			</Button>
		</>
	);
}
