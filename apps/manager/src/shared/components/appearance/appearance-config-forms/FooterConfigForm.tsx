import React, { useMemo } from "react";
import {
	AppAppearanceConfig,
	AppColorConfig,
	FooterConfig,
} from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";
import { useUpdateDatastoreEntry } from "../../../hooks/datastore";
import {
	APP_NAMESPACE,
	APPEARANCE_CONFIG_KEY,
} from "../../../constants/datastore";
import i18n from "@dhis2/d2-i18n";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import {
	FieldErrors,
	FormProvider,
	SubmitErrorHandler,
	useForm,
} from "react-hook-form";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { FooterLinksInput } from "./components/FooterLink/FooterLinksInput";
import { RHFRichTextAreaField } from "../../Fields/RHFRichTextAreaField";

type props = {
	configurations: AppAppearanceConfig;
	onClose: () => void;
	onComplete: () => void;
};

export function FooterConfigForm({
	configurations,
	onClose,
	onComplete,
}: props) {
	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const { update, loading, error } = useUpdateDatastoreEntry({
		namespace: APP_NAMESPACE,
	});

	const onUpdateConfiguration = async (data: FooterConfig) => {
		try {
			await update({
				key: APPEARANCE_CONFIG_KEY,
				data: {
					...configurations,
					footer: {
						...data,
					},
				},
			});
			if (error) {
				showAlert({
					message: i18n.t(
						`Error updating footer configurations. ${error.message}`,
					),
					type: { critical: true },
				});
			} else {
				showAlert({
					message: i18n.t(
						"Footer configurations updated successfully",
					),
					type: { success: true },
				});
			}
			onComplete();
			onClose();
		} catch (error: any) {
			console.error(error);
			showAlert({
				message: i18n.t("Error updating footer configurations"),
				type: { critical: true },
			});
		}
	};

	const form = useForm<FooterConfig>({
		defaultValues: { ...configurations.footer },
		mode: "onBlur",
	});

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
		// @Todo: Make this configurable, ensure that the form is not static. It should allow
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose}>
				<ModalTitle>{i18n.t("Footer configurations")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<RHFRichTextAreaField
							name="address.content"
							label={i18n.t("Address")}
						/>
						<RHFTextInputField
							type="text"
							name="copyright"
							label={i18n.t("Copyright")}
						/>
						<RHFTextInputField
							type="text"
							name="footerLinks.title"
							label={i18n.t("Footer links label")}
						/>
						<FooterLinksInput name="Links" />
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
