import {
	DataServiceConfig,
	dataServiceRuntimeConfig,
} from "@packages/shared/schemas";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
	NoticeBox,
} from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { PeriodSelector } from "./components/PeriodSelector";
import { z } from "zod";
import { FetchError, useAlert, useDataEngine } from "@dhis2/app-runtime";
import { ConfigSelector } from "./components/ConfigSelector";
import { useQueryClient } from "@tanstack/react-query";
import { RHFCheckboxField, RHFSingleSelectField } from "@hisptz/dhis2-ui";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";
import { RHFMultiSelectField } from "../../../../../Fields/RHFMultiSelectField";
import { SourceMetadataSelector } from "./components/SourceMetadataSelector";

const runConfigSchema = z.object({
	service: z.enum([
		"metadata-migration",
		"data-migration",
		"data-validation",
		"data-deletion",
	]),
	metadataSource: z.enum(["source", "flexiportal-config"]).optional(),
	metadataTypes: z.array(z.enum(["visualizations", "maps", "dashboards"])).optional(),
	selectedVisualizations: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
	selectedMaps: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
	selectedDashboards: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
	runtimeConfig: dataServiceRuntimeConfig,
	dataItemsConfigIds: z.array(z.string()).min(1, i18n.t("")),
});

export type RunConfigFormValues = z.infer<typeof runConfigSchema>;

export function RunConfigForm({
	hide,
	config,
	onClose,
}: {
	config: DataServiceConfig;
	hide: boolean;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const engine = useDataEngine();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<RunConfigFormValues>({
		defaultValues: {
			service: "metadata-migration",
			metadataSource: "source",
			metadataTypes: [],
			selectedVisualizations: [],
			selectedMaps: [],
			selectedDashboards: [],
			runtimeConfig: {
				pageSize: 10,
				paginateByData: false,
				timeout: 1000 * 60 * 5,
			},
			dataItemsConfigIds: [],
		},
	});

	const selectedService = useWatch({ control: form.control, name: "service" });
	const metadataSource = useWatch({ control: form.control, name: "metadataSource" });
	const metadataTypes = useWatch({ control: form.control, name: "metadataTypes" });


	const onSubmit = async (data: RunConfigFormValues) => {
		try {
			let requestData = { ...data };

			// Handle metadata migration with different sources
			if (data.service === "metadata-migration") {
				if (data.metadataSource === "source") {
					requestData = {
						...data,
						metadataSource: "source",
						selectedVisualizations: data.selectedVisualizations || [],
						selectedMaps: data.selectedMaps || [],
						selectedDashboards: data.selectedDashboards || [],
					};
				} else {
					requestData = {
						...data,
						metadataSource: "flexiportal-config",
					};
				}
			}

			await engine.mutate({
				type: "create" as const,
				resource: `routes/data-service/run/services/data-download/${config.id}`,
				data: requestData,
			});
			queryClient.invalidateQueries({
				queryKey: ["data-service-logs", config.id],
			});
			show({
				message: i18n.t("Service started successfully"),
				type: { success: true },
			});
			onClose();
		} catch (error) {
			console.error(error);
			show({
				message: i18n.t("Failed to start service, Error: ") +
					(error instanceof FetchError ? error.message : String(error)),
				type: { critical: true },
			});
		}
	}; return (
		<FormProvider {...form}>
			<Modal hide={hide} onClose={onClose} position="middle">
				<ModalTitle>
					{`${i18n.t("Run")} ${config.source.name}`}
				</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						{selectedService === "data-validation" && (
							<NoticeBox warning title={i18n.t("Analytics Required")}>
								{i18n.t(
									"Please ensure analytics have been run on the source instance before proceeding with validation. Running analytics ensures the data is up-to-date for accurate validation results."
								)}
							</NoticeBox>
						)}
						<RHFSingleSelectField
							label={i18n.t("Service Type")}
							name="service"
							placeholder={i18n.t("Select service type")}
							required
							options={[
								{
									label: i18n.t("Metadata Migration"),
									value: "metadata-migration",
								},
								{
									label: i18n.t("Data Migration"),
									value: "data-migration",
								},
								{
									label: i18n.t("Data Validation"),
									value: "data-validation",
								},
								{
									label: i18n.t("Data Deletion"),
									value: "data-deletion",
								},
							]}
						/>
						{selectedService === "metadata-migration" && (
							<>
								<RHFSingleSelectField
									name="metadataSource"
									label={i18n.t("Metadata Source")}
									placeholder={i18n.t("Select metadata source")}
									required
									options={[
										{ label: i18n.t("Browse from Source"), value: "source" },
										{ label: i18n.t("Extract from FlexiPortal Configuration"), value: "flexiportal-config" },
									]}
								/>

								{metadataSource === "source" && (
									<>
										<RHFMultiSelectField
											name="metadataTypes"
											label={i18n.t("Metadata Types")}
											placeholder={i18n.t("Select metadata types")}
											required
											options={[
												{ label: i18n.t("Visualizations"), value: "visualizations" },
												{ label: i18n.t("Maps"), value: "maps" },
												{ label: i18n.t("Dashboards"), value: "dashboards" },
											]}
										/>

										{metadataTypes?.includes("visualizations") && (
											<SourceMetadataSelector
												name="selectedVisualizations"
												resourceType="visualizations"
												label={i18n.t("Select Visualizations")}
												config={config}
												required
											/>
										)}

										{metadataTypes?.includes("maps") && (
											<SourceMetadataSelector
												name="selectedMaps"
												resourceType="maps"
												label={i18n.t("Select Maps")}
												config={config}
												required
											/>
										)}

										{metadataTypes?.includes("dashboards") && (
											<SourceMetadataSelector
												name="selectedDashboards"
												resourceType="dashboards"
												label={i18n.t("Select Dashboards")}
												config={config}
												required
											/>
										)}
									</>
								)}
							</>
						)}
						{selectedService != "metadata-migration" && (
							<>
								<PeriodSelector minPeriodType={"MONTHLY"} />
								<ConfigSelector config={config} />
								<RHFNumberField
									name={"runtimeConfig.pageSize"}
									label={i18n.t("Page size")}
								/>
								<RHFCheckboxField
									name={"runtimeConfig.paginateByData"}
									label={i18n.t("Paginate by data")}
								/>
							</>)
						}
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={form.formState.isSubmitting}
							onClick={(_, e) => form.handleSubmit(onSubmit)(e)}
							primary
						>
							{form.formState.isSubmitting
								? i18n.t("Requesting run...")
								: i18n.t("Run")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
