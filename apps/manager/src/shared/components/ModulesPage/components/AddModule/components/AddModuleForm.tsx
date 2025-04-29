import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import React, { useEffect } from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { FetchError, useAlert } from "@dhis2/app-runtime";
import { AppModule, moduleSchema, ModuleType } from "@packages/shared/schemas";
import { DashboardIDField } from "./DashboardIDField";
import { useCreateDashboard } from "../hooks/create";
import { ModuleTypeSelector } from "../../ModuleTypeSelector";

export function AddModuleForm({
	hide,
	onClose,
	onComplete,
}: {
	hide: boolean;
	onClose: () => void;
	onComplete: (dashboard: AppModule) => void;
}) {
	const { createDashboard } = useCreateDashboard();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<AppModule>({
		resolver: zodResolver(moduleSchema),
		shouldFocusError: false,
		defaultValues: {
			config: {
				id: "",
				grouped: false,
				layouts: {},
				items: [],
				title: "",
				type: ModuleType.VISUALIZATION,
			}
		},
	});
    const moduleType = form.watch("type");
    const moduleId = form.watch("id");
    useEffect(() => {
        if (moduleType === ModuleType.STATIC && moduleId) {
            form.setValue("config.namespace", `health-portal-${moduleId}`, {
                shouldValidate: true,
            });
        }
    }, [moduleType, moduleId, form]);

	const onSave = async (data: AppModule) => {
		try {
			await createDashboard(data);
			show({
				message: i18n.t("Module created successfully"),
				type: { success: true },
			});
			onComplete(data);
			onClose();
		} catch (e) {
			if (e instanceof FetchError || e instanceof Error) {
				show({
					message: `${i18n.t("Could not create new module")}: ${e.message ?? e.toString()}`,
					type: { critical: true },
				});
			}
		}
	};
	const onError = (e) => {
		if (e instanceof FetchError || e instanceof Error) {
			show({
				message: `${i18n.t("Please fix the validation errors before saving")}: ${e.message ?? e.toString()}`,
				type: { critical: true },
			});
		}
	}



	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Create Module")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFTextInputField
							required
							name="config.title"
							label={i18n.t("Title")}
						/>
						<ModuleTypeSelector/>
						<DashboardIDField />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={form.formState.isSubmitting}
							primary
                            onClick={(_, e) => form.handleSubmit(onSave,onError)(e)}						>
							{form.formState.isSubmitting
								? i18n.t("Creating...")
								: i18n.t("Create module")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
