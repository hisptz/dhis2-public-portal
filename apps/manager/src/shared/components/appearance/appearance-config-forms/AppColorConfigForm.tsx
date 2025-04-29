import React, { useMemo } from "react";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import { AppAppearanceConfig, AppColorConfig } from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";
import {
	FieldErrors,
	FormProvider,
	SubmitErrorHandler,
	useForm,
} from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { useUpdateDatastoreEntry } from "../../../hooks/datastore";
import {
	APP_NAMESPACE,
	APPEARANCE_CONFIG_KEY,
} from "../../../constants/datastore";
import { ColorPicker } from "./components/ColorPicker";
import { MultiColorPicker } from "./components/MultiColorPicker/MultiColorPicker";

type props = {
	configurations: AppAppearanceConfig;
	onClose: () => void;
	onComplete: () => void;
};

export function AppColorConfigForm({
	configurations,
	onClose,
	onComplete,
}: props) {
	const { update, loading, error } = useUpdateDatastoreEntry({
		namespace: APP_NAMESPACE,
	});

	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const form = useForm<AppColorConfig>({
		defaultValues: configurations.colors,
		mode: "onBlur",
	});

	const onUpdateConfiguration = async (data: AppColorConfig) => {
		try {
			await update({
				key: APPEARANCE_CONFIG_KEY,
				data: {
					...configurations,
					colors: {
						...data,
					},
				},
			});
			if (error) {
				showAlert({
					message: i18n.t(
						`Error updating color configurations. ${error.message}`,
					),
					type: { critical: true },
				});
			} else {
				showAlert({
					message: i18n.t(
						"Color configurations updated successfully",
					),
					type: { success: true },
				});
			}
			onComplete();
			onClose();
		} catch (error: any) {
			showAlert({
				message: i18n.t("Error updating color configurations"),
				type: { critical: true },
			});
		}
	};

	const buttonLabel = useMemo(() => {
		if (form.formState.isSubmitting) {
			return i18n.t("Updating...");
		}
		return i18n.t("Update");
	}, [form.formState.isSubmitting]);

	const onError: SubmitErrorHandler<AppColorConfig> = (
		errors: FieldErrors<AppColorConfig>,
	) => {
		console.error(errors);
		showAlert({
			message: i18n.t(
				"Could not save form. Fix the form errors fist and try again",
			),
			type: { critical: true },
		});
	};

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose}>
				<ModalTitle>
					{i18n.t("Application Color Configurations")}
				</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<ColorPicker
							name="primary"
							label={i18n.t("Primary color")}
						/>
						<ColorPicker
							name="background"
							label={i18n.t("Background color")}
						/>
						<MultiColorPicker
							label={i18n.t("Chart colors")}
							name="chartColors"
						/>
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button onClick={onClose} secondary>
							{i18n.t("Cancel")}
						</Button>
						<Button
							loading={loading || form.formState.isSubmitting}
							onClick={(_, e) => {
								form.handleSubmit(
									onUpdateConfiguration,
									onError,
								)(e);
							}}
							primary
						>
							{buttonLabel}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
