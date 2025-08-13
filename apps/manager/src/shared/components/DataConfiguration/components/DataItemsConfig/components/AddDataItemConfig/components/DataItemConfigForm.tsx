import {
	DataServiceDataSourceItemsConfig,
	DataServiceSupportedDataSourcesType,
	dataSourceItemsConfigSchema,
} from "@packages/shared/schemas";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";

import { startCase } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PeriodTypeCategory, PeriodUtility } from "@hisptz/dhis2-utils";
import { DataItemsConfig } from "./DataItemsConfig";

import { AttributeFields } from "./AttributeFields";
import { RHFIDField } from "../../../../../../Fields/IDField";
import { RHFNumberField } from "../../../../../../Fields/RHFNumberField";

export function DataItemConfigForm({
	data,
	onClose,
	onSubmit,
	hide,
}: {
	onClose: () => void;
	hide: boolean;
	onSubmit: (data: DataServiceDataSourceItemsConfig) => void;
	data?: DataServiceDataSourceItemsConfig;
}) {
	const form = useForm<DataServiceDataSourceItemsConfig>({
		resolver: zodResolver(dataSourceItemsConfigSchema),
		defaultValues: data,
	});
	const action = data ? i18n.t("Update") : i18n.t("Create");

	const onFormSubmit = (data: DataServiceDataSourceItemsConfig) => {
		onSubmit(data);
		onClose();
	};

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{`${action} ${i18n.t("data item configuration")}`}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<RHFSingleSelectField
							required
							label={i18n.t("Type")}
							name={"type"}
							options={Object.values(
								DataServiceSupportedDataSourcesType,
							).map((item) => ({
								label: startCase(item.toLowerCase()),
								value: item,
							}))}
						/>
						<RHFTextInputField
							required
							name={"name"}
							label={i18n.t("Name")}
						/>
						<RHFIDField
							dependsOn="name"
							label={i18n.t("ID")}
							name={"id"}
						/>
						<AttributeFields />
						<RHFSingleSelectField
							required
							name="periodTypeId"
							label={i18n.t("Period type")}
							options={PeriodUtility.fromObject({
								year: new Date().getFullYear(),
								category: PeriodTypeCategory.FIXED,
							}).periodTypes.map((periodType) => {
								return {
									label: periodType.config.name,
									value: periodType.id,
								};
							})}
						/>
						<RHFTextInputField
							required
							name="parentOrgUnitId"
							label={i18n.t("Parent organisation unit ID")}
							helpText={i18n.t(
								"The top level organisation unit on the source to fetch data from ",
							)}
						/>
						<RHFNumberField
							required
							name="orgUnitLevel"
							label={i18n.t("Organisation unit level")}
							helpText={i18n.t(
								"Organisation unit level at the source to pull data from",
							)}
						/>
						<DataItemsConfig />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							onClick={(_, e) => {
								form.handleSubmit(onFormSubmit)(e);
							}}
							primary
						>
							{action}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
