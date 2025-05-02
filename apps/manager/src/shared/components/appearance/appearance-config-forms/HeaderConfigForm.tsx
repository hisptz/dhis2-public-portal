import React, { useMemo, useState } from "react";
import {
	appAppearanceConfig,
	AppAppearanceConfig,
	HeaderConfig,
} from "@packages/shared/schemas";
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
import { StyleConfig } from "./components/AdvancedHeaderConfig/components/StyleConfig";
import { LogoConfig } from "./components/AdvancedHeaderConfig/components/LogoConfig";
import { HeaderStyleConfig } from "./components/AdvancedHeaderConfig/components/HeaderStyleConfig";
import { TitleConfig } from "./components/AdvancedHeaderConfig/components/TitleConfig";
import { zodResolver } from "@hookform/resolvers/zod";

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

	const form = useForm<AppAppearanceConfig>({
		defaultValues: configurations,
		resolver: zodResolver(appAppearanceConfig),
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

	const onUpdateConfiguration = async (data: AppAppearanceConfig) => {
		try {
			await update({
				key: APPEARANCE_CONFIG_KEY,
				data: {
					...configurations,
					...data,
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
			<Modal position="middle" onClose={onClose} large>
				<ModalTitle>{i18n.t("Header configurations")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						{/*Title config*/}
						<TitleConfig />
						<hr className="border-gray-200 my-2" />

						{/*Header style config*/}
						<HeaderStyleConfig />
						<hr className="border-gray-200 my-2" />

						{/*Leading logo*/}
						<LogoConfig
							logoType="leadingLogo"
							label={i18n.t("Leading logo")}
						/>

						{showAdvanced && (
							<>
								<hr className="border-gray-200 my-2" />

								{/*Trailing logo*/}
								<LogoConfig
									logoType="trailingLogo"
									label={i18n.t("Trailing logo")}
								/>
								<hr className="border-gray-200 my-2" />

								{/*	title style*/}
								<StyleConfig
									label={i18n.t("Title styles")}
									parentName={"header.title.style"}
								/>
								<hr className="border-gray-200 my-2" />

								{/*	subtitle style*/}
								<StyleConfig
									label={i18n.t("Subtitle styles")}
									parentName={"header.subtitle.style"}
								/>
							</>
						)}

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
							disabled={!form.formState.isValid}
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
