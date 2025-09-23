import { Divider, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import React, { ReactNode } from "react";
import i18n from "@dhis2/d2-i18n";
import { ModuleType } from "@packages/shared/schemas";
import { isEmpty, startCase } from "lodash";

type HeaderProps = {
	actions?: ReactNode;
	selectedType?: ModuleType;
	onTypeChange: (type: ModuleType | undefined) => void;
};

export function Header({ actions, selectedType, onTypeChange }: HeaderProps) {
	return (
		<div className="flex flex-col flex-shrink-0">
			<div className="flex items-center justify-between">
				<SingleSelectField
					label={i18n.t("Filter by Type")}
					className="w-64 "
					clearable
					selected={selectedType}
					onChange={({ selected }) => {
						if (!isEmpty(selected)) {
							onTypeChange(selected as ModuleType | undefined);
						} else {
							onTypeChange(undefined);
						}
					}}
					placeholder={i18n.t("Select type")}
				>
					{Object.values(ModuleType).map((module) => (
						<SingleSelectOption
							key={module}
							label={startCase(module.toLowerCase())}
							value={module}
						/>
					))}
				</SingleSelectField>
				<div className="pl-4 pt-4">{actions ?? null}</div>
			</div>
			<Divider />
		</div>
	);
}
