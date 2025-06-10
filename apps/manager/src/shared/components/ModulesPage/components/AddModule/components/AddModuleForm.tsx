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
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { FetchError, useAlert } from "@dhis2/app-runtime";
import {
	BaseModule,
	baseModuleSchema,
	ModuleType,
} from "@packages/shared/schemas";
import { DashboardIDField } from "./DashboardIDField";
import { useCreateModule } from "../hooks/create";
import { ModuleTypeSelector } from "../../ModuleTypeSelector";
import { useValidateModuleId } from "../hooks/moduleID";
import { set } from "lodash";

export function AddModuleForm({
	hide,
	onClose,
	onComplete,
}: {
	hide: boolean;
	onClose: () => void;
	onComplete: (dashboard: BaseModule) => void;
}) {
	const { createModule } = useCreateModule();
	const { checkIdExists } = useValidateModuleId();
	const moduleSchema = baseModuleSchema.refine(
		async (data) => {
			return !(await checkIdExists(data.id));
		},
		{
			message: i18n.t(
				"A module with this ID already exists. Please choose a different one.",
			),
			path: ["id"],
		},
	);

	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<BaseModule>({
		resolver: zodResolver(moduleSchema),
		shouldFocusError: false,
		defaultValues: {},
	});

	const onSave = async (data: BaseModule) => {
		try {
			if (
				[ModuleType.VISUALIZATION, ModuleType.DOCUMENTS].includes(
					data.type,
				)
			) {
				set(data, ["config", "grouped"], false);
			}
			if (data.type === ModuleType.VISUALIZATION) {
				set(data, ["config", "layouts"], {
					lg: [],
					md: [],
					sm: [],
					xs: [],
				});
			}

			await moduleSchema.parseAsync(data);
			await createModule(data);
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

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Create Module")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFTextInputField
							required
							name="label"
							label={i18n.t("Label")}
						/>
						<ModuleTypeSelector />
						<DashboardIDField />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={form.formState.isSubmitting}
							primary
							onClick={(_, e) => form.handleSubmit(onSave)(e)}
						>
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
