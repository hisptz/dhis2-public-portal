"use client";

import React, { useState } from "react";
import { Box, Button, Group, Modal, Text, Title } from "@mantine/core";
import { PeriodTypeCategory, PeriodUtility } from "@hisptz/dhis2-utils";
import {
	createFixedPeriodFromPeriodId,
	generateFixedPeriods,
} from "@dhis2/multi-calendar-dates";
import i18n from "@dhis2/d2-i18n";
import { SelectInputField } from "./SelectInputField";
import { first, intersectionBy, isEmpty } from "lodash";
import { YearInputField } from "./YearInputField";

export function CustomPeriodModal({
	open,
	periodState,
	onReset,
	handleClose,
	onUpdate,
	title,
	categories,
	periodTypes,
	periods,
}: {
	open: boolean;
	periodState?: string[];
	onReset: () => void;
	handleClose: () => void;
	onUpdate: (val: any) => void;
	title: string;
	categories?: ("RELATIVE" | "FIXED")[];
	periodTypes?: string[];
	periods?: string[];
}) {
	const defaultCategoryOptions = [
		{ label: "RELATIVE", value: PeriodTypeCategory.RELATIVE },
		{
			label: "FIXED",
			value: PeriodTypeCategory.FIXED,
		},
	];
	const categoryOptions =
		categories?.map((category: string) => {
			return { value: category.toUpperCase(), label: category };
		}) ?? defaultCategoryOptions;
	const currentYear = new Date().getFullYear();

	const [currentCategory, setCategory] = useState<string | undefined>(
		first(categoryOptions)?.value,
	);

	const periodUtility = currentCategory
		? PeriodUtility.fromObject({
				year: currentYear,
				category: currentCategory as unknown as PeriodTypeCategory,
				preference: {
					allowFuturePeriods: false,
				},
			})
		: null;

	const defaultPeriodTypes =
		periodUtility?.periodTypes.map((periodType) => {
			return {
				label: periodType.config.name,
				value: periodType.config.id,
			};
		}) ?? [];

	const periodTypesFromConfig = (
		periodTypes ?? ["QUARTERLY", "YEARLY", "MONTHLY"]
	)?.map((periodType) => {
		return { value: periodType, label: periodType.toLowerCase() };
	});

	const filteredPeriodTypes: {
		value: string;
		label: string;
	}[] = isEmpty(periodTypesFromConfig)
		? defaultPeriodTypes
		: intersectionBy(defaultPeriodTypes, periodTypesFromConfig!, "value");

	const periodTypeOptions = filteredPeriodTypes;

	const [currentPeriodType, setPeriodType] = useState<string | undefined>(
		first(periodTypeOptions)?.value,
	);

	const [selectedYear, setYear] = useState<number>(currentYear);

	const [selectedPeriods, setPeriods] = useState<any>();

	const relativePeriods =
		periodUtility
			?.getPeriodType(currentPeriodType ?? "")
			?.periods.map((period) => {
				return { value: period.id, label: period.name };
			}) ?? [];

	const fixedPeriods =
		currentCategory === PeriodTypeCategory.FIXED
			? generateFixedPeriods({
					year:
						currentPeriodType === "YEARLY" && selectedYear < 1009
							? 1009
							: selectedYear,
					calendar: "gregory",
					periodType: currentPeriodType,
				}).map((period: any) => ({
					value: period.id,
					label: period.displayName,
				}))
			: [];

	const defaultPeriods =
		currentCategory == PeriodTypeCategory.RELATIVE
			? relativePeriods
			: fixedPeriods;

	const periodsFromConfig = periods?.map((period) => {
		return { value: period, label: period.toLowerCase() };
	});

	const periodOptions = isEmpty(periodsFromConfig)
		? defaultPeriods
		: intersectionBy(defaultPeriods, periodsFromConfig!, "value");

	const sanitizedPeriodState = periodState?.map((id: string) => {
		const label =
			/^\d{4}$/.test(id) && parseInt(id) < 1009
				? id
				: PeriodUtility.getPeriodById(id).type.type ==
					  PeriodTypeCategory.FIXED
					? createFixedPeriodFromPeriodId({
							periodId: id,
							calendar: "gregory",
						})?.displayName
					: PeriodUtility.getPeriodById(id).name;
		return JSON.stringify({ value: id, label: label });
	});

	return (
		<Modal
			size="lg"
			title={
				<Text fw={"bold"} id="modal-title">
					{title}
				</Text>
			}
			key={`${title}-modal`}
			opened={open}
			onClose={handleClose}
			aria-labelledby="modal-title"
			aria-describedby="modal-description"
		>
			<Box key={`${title}-card`}>
				<div className="flex flex-row justify-between items-end">
					<Title id="modal-title" order={5}>
						{i18n.t(" Select Period(s)")}
					</Title>
					<Button
						onClick={() => {
							onReset();
							handleClose();
						}}
						disabled={isEmpty(periodState)}
						variant="subtle"
					>
						{i18n.t("Reset")}
					</Button>
				</div>

				<div
					id="modal-description"
					style={{ marginTop: 8, marginBottom: 16 }}
				>
					<SelectInputField
						key={`${title}-categories`}
						label={i18n.t("Categories")}
						value={currentCategory}
						onChange={setCategory}
						options={categoryOptions}
					/>

					<Group grow>
						<SelectInputField
							key={`${title}-period-types`}
							value={currentPeriodType}
							label={i18n.t("Period Types")}
							onChange={setPeriodType}
							options={periodTypeOptions}
						/>
						{currentCategory == PeriodTypeCategory.FIXED ? (
							<YearInputField
								key={`${title}-year`}
								label={i18n.t("Year")}
								onChange={setYear}
							/>
						) : null}
					</Group>

					<SelectInputField
						key={`${title}-periods`}
						label={i18n.t("Periods")}
						value={sanitizedPeriodState}
						onChange={setPeriods}
						options={periodOptions}
						multiple
					/>
				</div>
				<div className="flex flex-row justify-end gap-2">
					<Button
						onClick={() => {
							handleClose();
						}}
						variant="subtle"
						color="gray"
					>
						{i18n.t("Cancel")}
					</Button>
					<Button
						onClick={() => {
							onUpdate(selectedPeriods);
							handleClose();
						}}
						disabled={
							isEmpty(periodState) && isEmpty(selectedPeriods)
						}
					>
						{i18n.t("Update")}
					</Button>
				</div>
			</Box>
		</Modal>
	);
}
