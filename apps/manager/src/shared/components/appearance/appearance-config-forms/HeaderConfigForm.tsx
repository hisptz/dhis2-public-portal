import React, { useMemo, useState } from "react";
import { AppAppearanceConfig, HeaderConfig } from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";
import { useUpdateDatastoreEntry } from "../../../hooks/datastore";
import {
	APP_NAMESPACE,
	APPEARANCE_CONFIG_KEY,
} from "../../../constants/datastore";
import {
	FieldErrors,
	FormProvider,
	SubmitErrorHandler,
	useForm,
} from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	IconChevronDown16,
	IconChevronUp16,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import { RHFCheckboxField, RHFTextInputField } from "@hisptz/dhis2-ui";
import { AdvancedHeaderConfig } from "./components/AdvancedHeaderConfig/AdvancedHeaderConfig";

type props = {
	configurations: AppAppearanceConfig;
	onClose: () => void;
	onComplete: () => void;
};

export function HeaderConfigForm({
	configurations,
	onClose,
	onComplete,
}: props) {
	const [showAdvanced, setShowAdvances] = useState(false);
	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const { update, loading, error } = useUpdateDatastoreEntry({
		namespace: APP_NAMESPACE,
	});

	const form = useForm<HeaderConfig>({
		defaultValues: configurations.header,
		mode: "onBlur",
	});

	const buttonLabel = useMemo(() => {
		if (form.formState.isSubmitting) {
			return i18n.t("Updating...");
		}
		return i18n.t("Update");
	}, [form.formState.isSubmitting]);

	const onError: SubmitErrorHandler<HeaderConfig> = (
		errors: FieldErrors<HeaderConfig>,
	) => {
		console.error(errors);
		showAlert({
			message: i18n.t(
				"Could not save form. Fix the form errors fist and try again",
			),
			type: { critical: true },
		});
	};

	const onUpdateConfiguration = async (data: HeaderConfig) => {
		try {
			await update({
				key: APPEARANCE_CONFIG_KEY,
				data: {
					...configurations,
					header: {
						...configurations.header,
						...data,
					},
				},
			});
			if (error) {
				showAlert({
					message: i18n.t(
						`Error updating header configurations. ${error.message}`,
					),
					type: { critical: true },
				});
			} else {
				showAlert({
					message: i18n.t(
						"Header configurations updated successfully",
					),
					type: { success: true },
				});
			}
			onComplete();
			onClose();
		} catch (error: any) {
			console.error(error);
			showAlert({
				message: i18n.t("Error updating header configurations"),
				type: { critical: true },
			});
		}
	};

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose}>
				<ModalTitle>{i18n.t("Header configurations")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<RHFCheckboxField
							name="logo.enabled"
							label={i18n.t("Show Logo")}
						/>
						<RHFTextInputField
							type="url"
							name="trailingLogo"
							label={i18n.t("Trailing logo")}
						/>

						{/*Advanced Options*/}
						{showAdvanced && <AdvancedHeaderConfig />}

						{/*Advance Options toggle*/}
						<div
							onClick={() => setShowAdvances(!showAdvanced)}
							className="cursor-pointer text-gray-600 text-xs"
						>
							{showAdvanced ? (
								<div className="flex flex-row gap-1 items-center">
									<span>
										{i18n.t("Hide advanced options")}
									</span>
									<IconChevronUp16 />
								</div>
							) : (
								<div className="flex flex-row gap-1 items-center">
									<span>
										{i18n.t("Show advanced options")}
									</span>
									<IconChevronDown16 />
								</div>
							)}
						</div>
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
