import {
	DataServiceConfig,
	dataServiceRuntimeConfig,
} from "@packages/shared/schemas";
import { FormProvider, useForm } from "react-hook-form";
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
import { PeriodSelector } from "./components/PeriodSelector";
import { z } from "zod";
import { FetchError, useAlert, useDataEngine } from "@dhis2/app-runtime";
import { ConfigSelector } from "./components/ConfigSelector";
import { useQueryClient } from "@tanstack/react-query";
import { RHFCheckboxField } from "@hisptz/dhis2-ui";
import { RHFNumberField } from "../../../../../Fields/RHFNumberField";

const runConfigSchema = z.object({
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
			runtimeConfig: {
				pageSize: 10,
				paginateByData: false,
				timeout: 1000 * 60 * 5,
			},
			dataItemsConfigIds: [],
		},
	});

	const onSubmit = async (data: RunConfigFormValues) => {
		try {
			await engine.mutate({
				type: "create" as const,
				resource: `routes/data-service/run/services/data-download/${config.id}`,
				data,
			});
			await queryClient.invalidateQueries({
				queryKey: ["status", config.id],
			});
			show({
				message: i18n.t("Run requested successfully"),
				type: { success: true },
			});
			onClose();
		} catch (error) {
			if (error instanceof FetchError) {
				show({
					message: `${i18n.t("Error requesting run")}: ${error.message}`,
					type: { critical: true },
				});
			}
		}
	};

	return (
		<FormProvider {...form}>
			<Modal hide={hide} onClose={onClose} position="middle" small>
				<ModalTitle>
					{`${i18n.t("Run")} ${config.source.name}`}
				</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
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
