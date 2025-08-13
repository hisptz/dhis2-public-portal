import React, { useMemo } from "react";
import { Button, ButtonStrip, Field } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useController } from "react-hook-form";
import { RunConfigFormValues } from "../RunConfigForm";
import { DataServiceConfig } from "@packages/shared/schemas";
import { RHFMultiSelectField } from "../../../../../../Fields/RHFMultiSelectField";

export function ConfigSelector({ config }: { config: DataServiceConfig }) {
	const { field } = useController<RunConfigFormValues, "dataItemsConfigIds">({
		name: "dataItemsConfigIds",
	});

	const options = useMemo(() => {
		return config.itemsConfig.map(
			({ id, name, dataItems, type, periodTypeId }) => {
				return {
					label: `${name} (items: ${dataItems.length} period type: ${periodTypeId})`,
					value: id,
				};
			},
		);
	}, [config]);

	return (
		<Field required label={i18n.t("Configuration items")}>
			<div className="flex flex-col gap-2">
				<ButtonStrip>
					<Button
						onClick={() => {
							field.onChange(
								options.map((period) => period.value),
							);
						}}
						small
					>
						{i18n.t("Select all")}
					</Button>
					<Button
						onClick={() => {
							field.onChange([]);
						}}
						small
					>
						{i18n.t("Clear selection")}
					</Button>
				</ButtonStrip>
				<RHFMultiSelectField
					options={options}
					name={"dataItemsConfigIds"}
				/>
			</div>
		</Field>
	);
}
