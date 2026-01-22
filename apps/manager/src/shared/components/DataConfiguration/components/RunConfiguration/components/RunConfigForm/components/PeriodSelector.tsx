import React, { useMemo, useState } from "react";
import {
	FixedPeriodType,
	PeriodTypeCategory,
	PeriodUtility,
} from "@hisptz/dhis2-utils";
import {
	Button,
	ButtonStrip,
	Field,
	SingleSelectField,
	SingleSelectOption,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { RunConfigFormValues } from "../RunConfigForm";
import { RHFMultiSelectField } from "../../../../../../Fields/RHFMultiSelectField";

export function PeriodSelector({ minPeriodType }: { minPeriodType: string }) {
	const [year, setYear] = useState<number>(new Date().getFullYear());
	const periodType = useWatch<RunConfigFormValues, "runtimeConfig.periodType">({
		name: "runtimeConfig.periodType",
	});
	const periodTypes = useMemo(() => {
		const minimumPeriodType = FixedPeriodType.getFromId(minPeriodType, {});
		return PeriodUtility.fromObject({
			year,
			category: PeriodTypeCategory.FIXED,
			preference: {
				allowFuturePeriods: false,
			},
		}).periodTypes.filter(
			(type) => type.config.rank! >= minimumPeriodType.config.rank!,
		);
	}, [minPeriodType, year]);

	const periods = useMemo(() => {
		if (!periodType) return [];
		return PeriodUtility.fromObject({
			year,
			category: PeriodTypeCategory.FIXED,
			preference: {
				allowFuturePeriods: false,
			},
		}).getPeriodType(periodType)!.periods;
	}, [periodType, year]);

	const { field } = useController<
		RunConfigFormValues,
		"runtimeConfig.periods"
	>({
		name: "runtimeConfig.periods",
	});

	const { field: periodTypeField } = useController<
		RunConfigFormValues,
		"runtimeConfig.periodType"
	>({
		name: "runtimeConfig.periodType",
	});

	const { setValue } = useFormContext<RunConfigFormValues>();

	return (
		<div className="flex flex-col gap-2">
			<SingleSelectField
				required
				selected={periodTypeField.value}
				label="Period Type"
				onChange={({ selected }) => {
					periodTypeField.onChange(selected);
					setValue("runtimeConfig.periods", []);
					setValue("dataItemsConfigIds", []);
				}}
			>
				{periodTypes.map((periodType) => (
					<SingleSelectOption
						key={periodType.id}
						label={periodType.config.name}
						value={periodType.id}
					/>
				))}
			</SingleSelectField>

			<div className="flex gap-2 items-end">
				<div className="flex-1">
					<Field required label={i18n.t("Periods")}>
						<div className="flex flex-col gap-2">
							<ButtonStrip>
								<Button
									onClick={() => {
										field.onChange(
											periods.map((period) => period.id),
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
								key={`${periodType}-${year}`}
								options={periods.map((period) => ({
									label: period.name,
									value: period.id,
								}))}
								name={"runtimeConfig.periods"}
							/>
						</div>
					</Field>
				</div>
				<SingleSelectField
					required
					selected={year.toString()}
					label="Year"
					onChange={({ selected }) => {
						field.onChange([]);
						setYear(+selected)
					}}
				>
					{Array.from(
						{ length: 10 },
						(_, i) => new Date().getFullYear() - i,
					).map((year) => (
						<SingleSelectOption
							key={year}
							label={year.toString()}
							value={year.toString()}
						/>
					))}
				</SingleSelectField>
			</div>
		</div>
	);
}
