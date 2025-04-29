import { Divider } from "@dhis2/ui";
import React, { ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { typeFilter } from "../../../schemas/filters";
import { ModuleType } from "@packages/shared/schemas";
import { startCase } from "lodash";

type HeaderProps = {
	actions?: ReactNode;
	selectedType?: ModuleType;
	onTypeChange: (type: ModuleType | undefined) => void;
};

export function Header({ actions, selectedType, onTypeChange }: HeaderProps) {
	const form = useForm<typeFilter>({
		defaultValues: {
			type: selectedType,
		},
	});

	const { watch, reset } = form;
	const watchedType = watch("type") as ModuleType | "" | undefined;

	useEffect(() => {
		const valueToPass =
			watchedType === ""
				? undefined
				: (watchedType as ModuleType | undefined);

		if (valueToPass !== selectedType) {
			onTypeChange(valueToPass);
		}
	}, [watchedType, selectedType, onTypeChange]);

	useEffect(() => {
		reset({ type: selectedType });
	}, [selectedType, reset]);

	return (
		<div className="flex flex-col flex-shrink-0">
			<div className="flex items-center justify-between">
				<FormProvider {...form}>
					<RHFSingleSelectField
						label={i18n.t("Filter by Type")}
						className="w-64 "
						clearable
						value={selectedType}
						placeholder={i18n.t("Select type")}
						options={Object.values(ModuleType).map((module) => ({
							label: startCase(module.toLowerCase()),
							value: module,
						}))}
						name="type"
					/>
				</FormProvider>
				<div className="pl-4 pt-4">{actions ?? null}</div>
			</div>
			<Divider />
		</div>
	);
}
